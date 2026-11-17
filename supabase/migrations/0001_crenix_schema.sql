-- CRENIX TECHNOLOGY — initial schema (Step 11)
-- STATUS: PROPOSAL. Not applied anywhere. Review, then run on a Supabase project
-- (SQL editor or `supabase db push`) only after the owner approves Steps 10–11.
--
-- Security model
--  * Row Level Security is ON for every table.
--  * Public catalog data (categories, prompt metadata, tutorials, capability profiles,
--    approved plans) is readable by anyone.
--  * Premium prompt TEXT lives in a separate table readable only by Free-tier rows
--    or users with an active Premium subscription (checked in the database).
--  * User data (saved prompts, favorites, projects, progress) is readable/writable
--    only by its owner (owner_id = auth.uid()).
--  * Subscriptions and payment records have NO client write policies: only the
--    server (service role, after verifying a payment-provider webhook) can write them.

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- catalog ----------
create table public.prompt_categories (
  slug        text primary key check (slug in ('video-editing','image','content','video')),
  title       text not null,
  title_th    text not null,
  description text not null default '',
  sort_order  int  not null default 0
);

create table public.library_prompts (
  id               text primary key check (id ~ '^[a-z0-9-]{3,80}$'),
  category         text not null references public.prompt_categories(slug),
  title            text not null check (char_length(title) between 1 and 120),
  description      text not null default '',
  tier             text not null check (tier in ('free','premium')),
  badges           text[] not null default '{}',
  recommended      boolean not null default false,
  recommended_tool text not null default '',
  tools            text[] not null default '{}',
  keywords         text[] not null default '{}',
  popularity       int not null default 0,
  preview          jsonb not null default '{}'::jsonb,
  published        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- Prompt bodies split out so Premium text is protected by RLS
create table public.library_prompt_bodies (
  prompt_id text primary key references public.library_prompts(id) on delete cascade,
  prompt_en text not null check (char_length(prompt_en) <= 20000),
  prompt_th text not null check (char_length(prompt_th) <= 20000)
);

create table public.tutorials (
  slug                text primary key check (slug ~ '^[a-z0-9-]{3,80}$'),
  category            text not null,
  title               text not null,
  summary             text not null default '',
  level               text not null check (level in ('Beginner','Intermediate','Advanced')),
  minutes             int  not null default 3 check (minutes > 0),
  premium             boolean not null default false,
  steps               jsonb not null default '[]'::jsonb,
  tips                jsonb not null default '[]'::jsonb,
  sources             jsonb not null default '[]'::jsonb,
  checked_at          date not null,
  recommended_prompts text[] not null default '{}',
  published           boolean not null default true
);

create table public.model_capability_profiles (
  id           text primary key,
  name         text not null,
  model        text not null,
  categories   text[] not null default '{}',
  capabilities jsonb not null,           -- { clipSeconds: {status,value,note}, ... } same shape as the app
  sources      jsonb not null default '[]'::jsonb,
  checked_at   date not null
);

-- ---------- plans & billing ----------
create table public.subscription_plans (
  id                 text primary key check (id in ('free','premium')),
  name               text not null,
  features           text[] not null default '{}',
  quotas             jsonb  not null default '{}'::jsonb,
  -- Prices stay NULL until the owner approves them; the app shows "not announced" for NULL
  price_monthly_thb  numeric(10,2),
  price_yearly_thb   numeric(10,2),
  approved           boolean not null default false,
  provider_price_ids jsonb not null default '{}'::jsonb   -- e.g. Stripe price ids, filled by the owner
);

create table public.user_subscriptions (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  plan_id                  text not null references public.subscription_plans(id),
  cycle                    text not null check (cycle in ('monthly','yearly')),
  status                   text not null check (status in ('active','trialing','past_due','canceled','expired')),
  current_period_end       timestamptz not null,
  cancel_at_period_end     boolean not null default false,
  provider                 text not null check (provider in ('stripe','opn')),
  provider_customer_id     text,
  provider_subscription_id text,
  updated_at               timestamptz not null default now()
);
create trigger trg_subscriptions_updated before update on public.user_subscriptions
  for each row execute function public.set_updated_at();

create table public.payment_records (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  provider          text not null check (provider in ('stripe','opn')),
  -- Unique event id makes webhook processing idempotent (retries can't double-apply)
  provider_event_id text not null unique,
  provider_charge_id text,
  amount_satang     bigint not null check (amount_satang >= 0),
  currency          text not null default 'THB',
  status            text not null check (status in ('succeeded','failed','refunded','pending')),
  raw               jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);
create index on public.payment_records (user_id, created_at desc);

-- Same rules as src/lib/subscription.ts effectivePlan() (3-day grace for past_due)
create or replace function public.has_active_premium(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_subscriptions s
    where s.user_id = uid
      and s.plan_id = 'premium'
      and (
        (s.status in ('active','trialing','canceled') and now() <= s.current_period_end)
        or (s.status = 'past_due' and now() <= s.current_period_end + interval '3 days')
      )
  );
$$;

-- ---------- user data ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when a user signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.user_saved_prompts (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  category    text not null references public.prompt_categories(slug),
  prompt_en   text not null default '' check (char_length(prompt_en) <= 20000),
  prompt_th   text not null default '' check (char_length(prompt_th) <= 20000),
  tags        text[] not null default '{}' check (cardinality(tags) <= 20),
  collection  text not null default '' check (char_length(collection) <= 60),
  source      jsonb not null default '{"type":"manual"}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.user_saved_prompts (owner_id, updated_at desc);
create trigger trg_saved_updated before update on public.user_saved_prompts
  for each row execute function public.set_updated_at();

create table public.favorites (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prompt_id  text not null references public.library_prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table public.recent_activity (
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind     text not null check (kind in ('library','saved')),
  item_id  text not null,
  action   text not null check (action in ('view','copy','customize')),
  at       timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

create table public.planner_projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 120),
  total_seconds int  not null check (total_seconds between 1 and 3600),
  data          jsonb not null,           -- settings + scenes, same shape as the app's Project
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_projects_updated before update on public.planner_projects
  for each row execute function public.set_updated_at();

create table public.tutorial_progress (
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tutorial_slug text not null references public.tutorials(slug) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (user_id, tutorial_slug)
);

-- ---------- Row Level Security ----------
alter table public.prompt_categories         enable row level security;
alter table public.library_prompts           enable row level security;
alter table public.library_prompt_bodies     enable row level security;
alter table public.tutorials                 enable row level security;
alter table public.model_capability_profiles enable row level security;
alter table public.subscription_plans        enable row level security;
alter table public.user_subscriptions        enable row level security;
alter table public.payment_records           enable row level security;
alter table public.profiles                  enable row level security;
alter table public.user_saved_prompts        enable row level security;
alter table public.favorites                 enable row level security;
alter table public.recent_activity           enable row level security;
alter table public.planner_projects          enable row level security;
alter table public.tutorial_progress         enable row level security;

-- Public catalog (read-only for clients; edits via service role / dashboard)
create policy "categories readable"   on public.prompt_categories         for select using (true);
create policy "prompts readable"      on public.library_prompts           for select using (published);
create policy "tutorials readable"    on public.tutorials                 for select using (published);
create policy "capabilities readable" on public.model_capability_profiles for select using (true);
create policy "plans readable"        on public.subscription_plans        for select using (id = 'free' or approved);

-- Prompt text: free prompts for everyone, premium only with an active subscription
create policy "prompt bodies by tier" on public.library_prompt_bodies for select using (
  exists (
    select 1 from public.library_prompts p
    where p.id = prompt_id and p.published
      and (p.tier = 'free' or public.has_active_premium(auth.uid()))
  )
);

-- Billing: users can read their own rows; NO insert/update/delete policies (server only)
create policy "own subscription readable" on public.user_subscriptions for select using (user_id = auth.uid());
create policy "own payments readable"     on public.payment_records    for select using (user_id = auth.uid());

-- Profiles
create policy "own profile readable" on public.profiles for select using (id = auth.uid());
create policy "own profile editable" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Owner-only user data (all operations)
create policy "own saved prompts" on public.user_saved_prompts for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own favorites" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own recent" on public.recent_activity for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own projects" on public.planner_projects for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own tutorial progress" on public.tutorial_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Seed plans (prices NULL until approved by the owner)
insert into public.subscription_plans (id, name, features, approved) values
  ('free', 'Free', array['free-prompts','copy-prompts','prompt-builder','save-prompts'], true),
  ('premium', 'Premium', array['free-prompts','premium-prompts','copy-prompts','prompt-builder','save-prompts','long-video-planner','premium-tutorials'], false);
