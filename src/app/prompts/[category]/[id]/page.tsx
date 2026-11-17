import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronRight, Languages, ListChecks, Lock, Sparkles, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { HighlightedPrompt } from "@/components/prompt-card";
import { PreviewArt } from "@/components/library/preview-art";
import { StatusBadge, TierBadge } from "@/components/library/badges";
import { CopyPromptButton, FavoriteButton } from "@/components/library/prompt-actions";
import { RelatedPrompts } from "@/components/library/related-prompts";
import { builderHref, categoryLabel, sortPrompts, type LibraryPrompt } from "@/components/library/types";
import { getLibraryPrompt, libraryHowTo, libraryPrompts } from "@/data/library";
import { getCurrentPlan } from "@/lib/account";
import { can } from "@/lib/plans";

type Props = PageProps<"/prompts/[category]/[id]">;

export function generateStaticParams() {
  return libraryPrompts.map((p) => ({ category: p.category, id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = getLibraryPrompt(id);
  if (!item) return {};
  return { title: `${item.title} — CRENIX Prompt Library`, description: item.description };
}

export default function PromptDetailPage({ params }: Props) {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="prompts" />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-20 sm:px-6">
        {/* params are read inside Suspense so navigation can show the shell instantly */}
        <Suspense fallback={<DetailSkeleton />}>
          <PromptDetail params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function PromptDetail({ params }: { params: Props["params"] }) {
  const { category, id } = await params;
  const item = getLibraryPrompt(id);
  if (!item || item.category !== category) notFound();

  // Access check is ready; it only blocks once ENFORCE_PERMISSIONS is on (needs real accounts, Step 10–11)
  const locked = item.tier === "premium" && !can(getCurrentPlan(), "premium-prompts");
  const howTo = libraryHowTo[item.category];
  const related = sortPrompts(
    libraryPrompts.filter((p) => p.category === item.category && p.id !== item.id),
    "recommended",
  ).slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
        <Link href="/" className="hover:text-lux-bright">หน้าแรก</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/prompts" className="hover:text-lux-bright">Prompt Library</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/prompts/${item.category}`} className="hover:text-lux-bright">{categoryLabel(item.category)}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-200">{item.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-lux-gold/30">
            <PreviewArt item={item} />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              <TierBadge tier={item.tier} />
              {item.badges.map((b) => (
                <StatusBadge key={b} badge={b} />
              ))}
            </div>
            <span className="absolute right-4 bottom-4 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] text-stone-300 backdrop-blur">
              ภาพประกอบ
            </span>
          </div>

          <Link href={`/prompts/${item.category}`} className="mt-6 inline-flex items-center gap-1 text-sm text-lux-gold hover:text-lux-bright">
            <ArrowLeft className="h-3.5 w-3.5" /> {categoryLabel(item.category)}
          </Link>
          <h1 className="mt-1 text-3xl leading-tight font-extrabold text-white sm:text-4xl">{item.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-stone-300">{item.description}</p>

          {/* On mobile/tablet the actions sit right under the title; on desktop they live in the sidebar */}
          <div className="mt-6 lg:hidden">
            <DetailActions item={item} locked={locked} />
          </div>

          {/* English prompt */}
          <section className="mt-8" aria-labelledby="prompt-en">
            <div className="flex items-center justify-between gap-3">
              <h2 id="prompt-en" className="flex items-center gap-2 text-lg font-bold text-lux-bright">
                <Sparkles className="h-5 w-5" /> Prompt (English)
              </h2>
              {!locked && <CopyPromptButton text={item.promptEn} label="Copy" variant="subtle" />}
            </div>
            <PromptBox text={item.promptEn} locked={locked} />
            {!locked && (
              <p className="mt-2 text-xs text-stone-400">
                ✏️ เปลี่ยนคำใน <span className="text-amber-300">[ ]</span> ที่ไฮไลต์ไว้ให้เป็นข้อมูลของคุณก่อนใช้งาน
              </p>
            )}
          </section>

          {/* Thai translation */}
          <section className="mt-8" aria-labelledby="prompt-th">
            <div className="flex items-center justify-between gap-3">
              <h2 id="prompt-th" className="flex items-center gap-2 text-lg font-bold text-white">
                <Languages className="h-5 w-5 text-lux-gold" /> คำแปลภาษาไทย
              </h2>
              {!locked && <CopyPromptButton text={item.promptTh} label="Copy ภาษาไทย" variant="subtle" />}
            </div>
            <PromptBox text={item.promptTh} locked={locked} muted />
          </section>

          {/* How to use */}
          <section className="mt-8 rounded-2xl border border-lux-gold/25 bg-lux-card p-6" aria-labelledby="how-to">
            <h2 id="how-to" className="flex items-center gap-2 text-lg font-bold text-white">
              <ListChecks className="h-5 w-5 text-lux-gold" /> วิธีใช้งาน
            </h2>
            <ol className="mt-4 space-y-3">
              {howTo.map((step, i) => (
                <li key={step} className="flex gap-3 text-stone-300">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lux-gold text-sm font-bold text-black">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">
            <DetailActions item={item} locked={locked} />
          </div>

          <div className="rounded-2xl border border-lux-gold/25 bg-lux-card p-5">
            <h2 className="text-sm font-semibold text-stone-400">AI Tool ที่แนะนำ</h2>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Sparkles className="h-5 w-5 text-lux-bright" /> {item.recommendedTool}
            </p>
            <p className="mt-4 text-sm font-semibold text-stone-400">ใช้กับ AI อื่นได้ด้วย</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {item.tools
                .filter((t) => t !== item.recommendedTool)
                .map((t) => (
                  <li key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-stone-300">
                    {t}
                  </li>
                ))}
            </ul>
          </div>

          <dl className="space-y-3 rounded-2xl border border-lux-gold/25 bg-lux-card p-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">หมวดหมู่</dt>
              <dd className="text-white">{categoryLabel(item.category)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">ประเภท</dt>
              <dd className="text-white">{item.tier === "free" ? "Free" : "Premium"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-1 text-stone-400">
                <CalendarDays className="h-4 w-4" /> เพิ่มเมื่อ
              </dt>
              <dd className="text-white">
                {new Date(item.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
              </dd>
            </div>
            <div>
              <dt className="text-stone-400">คำสำคัญ</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {item.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-lux-gold/10 px-2.5 py-0.5 text-xs text-lux-bright">
                    #{k}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="mb-5 text-2xl font-bold text-white">
            Prompt อื่นในหมวด {categoryLabel(item.category)}
          </h2>
          <RelatedPrompts items={related} />
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
        <Link href={`/prompts/${item.category}`} className="inline-flex items-center gap-2 text-lux-gold hover:text-lux-bright">
          <ArrowLeft className="h-4 w-4" /> Back to {categoryLabel(item.category)}
        </Link>
        <Link href="/prompts" className="inline-flex items-center gap-2 text-stone-400 hover:text-lux-bright">
          กลับไปที่ Prompt Library
        </Link>
      </div>
    </>
  );
}

function DetailActions({ item, locked }: { item: LibraryPrompt; locked: boolean }) {
  return (
    <div className="rounded-2xl border border-lux-gold/40 bg-lux-card p-5 shadow-[0_0_40px_rgba(198,161,91,0.12)]">
      <div className="flex flex-col gap-3">
        {locked ? (
          <p className="flex items-center justify-center gap-2 rounded-full border border-lux-gold/50 px-5 py-3 text-sm text-lux-bright">
            <Lock className="h-4 w-4" /> Prompt นี้สำหรับสมาชิก Premium
          </p>
        ) : (
          <CopyPromptButton text={item.promptEn} className="w-full" />
        )}
        <FavoriteButton id={item.id} className="w-full" />
        <Link
          href={builderHref(item)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-lux-bright/70 bg-lux-gold/10 px-5 py-3 font-medium text-lux-bright transition hover:bg-lux-gold/20"
        >
          <Wand2 className="h-5 w-5" /> Customize This Prompt
        </Link>
      </div>
    </div>
  );
}

function PromptBox({ text, locked, muted }: { text: string; locked: boolean; muted?: boolean }) {
  return (
    <div
      className={`relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-lux-card p-5 leading-relaxed whitespace-pre-line ${
        muted ? "text-stone-300" : "text-stone-100"
      }`}
    >
      <div className={locked ? "pointer-events-none blur-sm select-none" : ""}>
        <HighlightedPrompt text={text} />
      </div>
      {locked && (
        <div className="absolute inset-0 grid place-items-center bg-black/40">
          <span className="flex items-center gap-2 text-sm font-semibold text-lux-bright">
            <Lock className="h-4 w-4" /> เฉพาะสมาชิก Premium
          </span>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="กำลังโหลด">
      <div className="space-y-4">
        <div className="aspect-[21/9] animate-pulse rounded-3xl bg-white/5" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
