import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Clapperboard,
  Clock,
  FilePenLine,
  Flame,
  Gem,
  Heart,
  Image as ImageIcon,
  Infinity as InfinityIcon,
  Layers,
  Play,
  Sparkles,
  Star,
  Target,
  Video,
  WandSparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { CategorySlug } from "@/data/prompts";

const heroTags = ["Edit Video Prompt", "Image Prompt", "Content Prompt", "Video Prompt"];

type Category = {
  title: string;
  desc: string;
  icon: LucideIcon;
  art: "edit" | "image" | "content" | "video";
  slug: CategorySlug;
};

const categories: Category[] = [
  { title: "Video Editing Prompts", desc: "Prompt สำหรับตัดต่อวิดีโอ", icon: Clapperboard, art: "edit", slug: "video-editing" },
  { title: "Image Creation Prompts", desc: "Prompt สำหรับสร้างภาพ", icon: ImageIcon, art: "image", slug: "image" },
  {
    slug: "content",
    title: "Content Prompts",
    desc: "Prompt สำหรับสร้างคอนเทนต์ (ข้อความ/แคปชั่น/สคริปต์)",
    icon: FilePenLine,
    art: "content",
  },
  {
    slug: "video",
    title: "Video Creation Prompts",
    desc: "Prompt สำหรับสร้างคลิปวิดีโอ (จากข้อความหรือภาพ)",
    icon: Video,
    art: "video",
  },
];

const sellingPoints: { icon: LucideIcon; text: string; sub: string }[] = [
  { icon: Zap, text: "Prompt สำเร็จรูป", sub: "พร้อมใช้ทันที" },
  { icon: Target, text: "ผลลัพธ์ระดับ", sub: "มืออาชีพ" },
  { icon: Clock, text: "ประหยัดเวลา", sub: "สร้างงานได้เร็ว" },
  { icon: Layers, text: "หลากหลายสไตล์", sub: "ครบทุกงานสร้างสรรค์" },
];

const quickLinks: { icon: LucideIcon; label: string }[] = [
  { icon: Flame, label: "Prompt ยอดนิยม" },
  { icon: BadgeCheck, label: "Prompt ใหม่" },
  { icon: Star, label: "Prompt แนะนำ" },
  { icon: Heart, label: "รายการโปรด" },
  { icon: Clock, label: "ใช้งานล่าสุด" },
];

/* ---------- Decorative card art (pure CSS, no image files) ---------- */
function CardArt({ kind }: { kind: Category["art"] }) {
  if (kind === "edit") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-y-4 right-6 left-0 skew-x-[-12deg] rounded-md border border-indigo-400/40 bg-indigo-950/80 p-2">
          <div className="grid h-1/2 grid-cols-3 gap-1">
            <div className="rounded-sm bg-linear-to-br from-orange-300 to-indigo-700" />
            <div className="rounded-sm bg-linear-to-br from-sky-300 to-purple-700" />
            <div className="rounded-sm bg-linear-to-br from-amber-200 to-rose-700" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-3/4 rounded bg-purple-500" />
            <div className="h-1.5 w-1/2 rounded bg-sky-400" />
          </div>
        </div>
        <span className="absolute right-0 bottom-3 text-3xl">✂️</span>
      </div>
    );
  }
  if (kind === "image") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-tr-2xl bg-linear-to-b from-sky-700 via-orange-400 to-amber-200">
        <div className="absolute top-3 right-8 h-8 w-8 rounded-full bg-amber-100 blur-[2px]" />
        <svg viewBox="0 0 200 100" className="absolute inset-x-0 bottom-0 h-3/4 w-full" preserveAspectRatio="none">
          <path d="M0 100 L40 45 L70 70 L110 15 L150 60 L175 40 L200 65 L200 100 Z" fill="#3b2a3a" />
          <path d="M0 100 L30 70 L80 85 L120 55 L170 85 L200 75 L200 100 Z" fill="#1c1420" />
          <path d="M110 15 L100 30 L112 28 L120 32 Z" fill="#f5e6d3" />
        </svg>
      </div>
    );
  }
  if (kind === "content") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute top-2 right-4 bottom-0 left-6 rotate-[-8deg] rounded-md bg-stone-100 p-3 shadow-xl">
          <div className="mb-2 h-2 w-1/2 rounded bg-stone-500" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-1.5 h-1 rounded bg-stone-300" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
        <div className="absolute top-2 left-0 h-full w-2 rounded bg-amber-500/60 blur-sm" />
      </div>
    );
  }
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="absolute inset-4 rounded-full bg-fuchsia-600/40 blur-2xl" />
      <div className="relative grid h-16 w-28 place-items-center rounded-lg border-2 border-fuchsia-400 bg-indigo-950 shadow-[0_0_25px_rgba(217,70,239,0.8)]">
        <Play className="h-7 w-7 fill-fuchsia-400 text-fuchsia-300" />
      </div>
    </div>
  );
}

/* ---------- Laptop mockup for the hero ---------- */
function LaptopMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-amber-500/25 blur-3xl" />
      {/* Screen */}
      <div className="relative rounded-t-2xl border-[6px] border-zinc-700 bg-zinc-950 p-2 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
        <div className="flex gap-2">
          <div className="hidden w-14 flex-col gap-1.5 sm:flex">
            {["from-amber-300 to-indigo-700", "from-sky-300 to-indigo-800", "from-orange-300 to-purple-800", "from-amber-200 to-rose-800"].map((g) => (
              <div key={g} className={`h-8 rounded bg-linear-to-br ${g}`} />
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded bg-linear-to-b from-indigo-900 via-orange-400 to-amber-200">
            <svg viewBox="0 0 200 100" className="block h-auto w-full" preserveAspectRatio="none">
              <path d="M0 100 L45 40 L80 70 L120 20 L160 60 L200 45 L200 100 Z" fill="#2b1d33" />
              <path d="M0 100 L40 75 L90 88 L140 62 L200 85 L200 100 Z" fill="#140f18" />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-black/60 backdrop-blur">
                <Play className="h-5 w-5 fill-white text-white" />
              </span>
            </div>
          </div>
        </div>
        {/* Timeline */}
        <div className="mt-2 space-y-1 rounded bg-zinc-900 p-2">
          <div className="flex gap-1">
            <div className="h-2 w-1/3 rounded bg-sky-500" />
            <div className="h-2 w-1/4 rounded bg-sky-400" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-1/5 rounded bg-fuchsia-500" />
            <div className="h-2 w-2/5 rounded bg-purple-500" />
          </div>
          <div className="h-2 w-4/5 rounded bg-emerald-400" />
        </div>
      </div>
      {/* Base */}
      <div className="relative mx-[-6%] h-4 rounded-b-xl bg-linear-to-b from-zinc-400 to-zinc-600" />
      <div className="mx-auto h-1.5 w-1/4 rounded-b bg-zinc-500" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#050403] text-stone-100">
      {/* Background glow swooshes */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute top-40 -left-40 h-[500px] w-[700px] rounded-full bg-amber-600/15 blur-3xl" />
        <div className="absolute top-10 right-0 h-[500px] w-[600px] rounded-full bg-orange-500/15 blur-3xl" />
        <svg className="absolute top-24 left-0 h-[600px] w-full opacity-70" viewBox="0 0 1600 600" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="swoosh" x1="0" x2="1">
              <stop offset="0" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fbbf24" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 420 C 400 300, 700 520, 1000 380 S 1500 200, 1600 260" stroke="url(#swoosh)" strokeWidth="2" />
          <path d="M0 470 C 450 360, 750 560, 1050 420 S 1500 260, 1600 320" stroke="url(#swoosh)" strokeWidth="1" />
        </svg>
      </div>

      <SiteHeader active="home" />

      <main className="relative z-10 flex-1">
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <p className="text-xs tracking-[0.3em] text-stone-300 sm:text-sm">THE PROMPT PLATFORM FOR CREATORS</p>
            <h1 className="text-gold mt-3 pr-2 text-[2rem] leading-tight font-extrabold italic sm:text-6xl">
              Ready-to-Use Prompts
            </h1>
            <p className="mt-3 text-lg font-medium sm:text-2xl">
              for Video Editing, Image Creation, Content &amp; Video Production
            </p>
            <p className="mt-3 text-base leading-relaxed text-stone-300 sm:text-xl">
              คลัง Prompt สำเร็จรูป พร้อมใช้งาน
              <br />
              ช่วยให้คุณสร้างภาพ ตัดต่อวิดีโอ ทำคอนเทนต์ และผลิตคลิปวิดีโอได้ง่ายขึ้น
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/prompts"
                className="gold-btn flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-lg font-semibold transition hover:brightness-110"
              >
                <Sparkles className="h-5 w-5" /> Browse Prompts <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/tutorials/library-to-builder"
                className="gold-outline flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-lg transition hover:bg-amber-500/10"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full border border-amber-400">
                  <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
                Watch How It Works
              </Link>
            </div>
          </div>

          {/* Visual: prompt tags + laptop + badge */}
          <div className="relative">
            <LaptopMock />
            <ul className="mt-6 grid grid-cols-2 gap-3 lg:absolute lg:top-4 lg:-left-16 lg:mt-0 lg:grid-cols-1">
              {heroTags.map((t) => (
                <li
                  key={t}
                  className="gold-card flex items-center gap-2 rounded-xl px-3 py-2 text-sm italic lg:-skew-y-3"
                >
                  <CircleCheck className="h-5 w-5 shrink-0 fill-amber-400 text-black" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="gold-card absolute -top-6 right-0 hidden rotate-[-8deg] rounded-xl px-4 py-3 sm:block">
              <div className="flex items-center gap-2">
                <WandSparkles className="h-7 w-7 text-amber-300" />
                <p className="text-gold leading-tight font-bold italic">
                  AI Prompt
                  <br />
                  Ready to Use
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1 w-24 rounded bg-amber-400/70" />
                <div className="h-1 w-16 rounded bg-amber-400/50" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Categories ---------- */}
        <section id="categories" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-linear-to-r from-transparent to-amber-500/70" />
            <h2 className="text-gold text-center text-xl font-bold sm:text-4xl">เลือกใช้งาน Prompt ตามเป้าหมาย</h2>
            <span className="h-px flex-1 bg-linear-to-l from-transparent to-amber-500/70" />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ title, desc, icon: Icon, art, slug }) => (
              <Link
                key={title}
                href={`/prompts/${slug}`}
                className="gold-card group relative flex min-h-48 flex-col overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[0_0_36px_rgba(245,158,11,0.4)]"
              >
                <div className="absolute top-0 right-0 h-24 w-[46%] opacity-90 [mask-image:linear-gradient(to_left,black_55%,transparent)]">
                  <CardArt kind={art} />
                </div>
                <Icon className="relative h-11 w-11 text-amber-400" strokeWidth={1.5} />
                <h3 className="relative mt-6 text-xl font-semibold [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">{title}</h3>
                <p className="relative mt-1 pr-10 text-sm text-stone-300">{desc}</p>
                <span className="gold-btn absolute right-4 bottom-4 grid h-9 w-9 place-items-center rounded-full transition group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Why CRENIX ---------- */}
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <div className="gold-card grid gap-6 rounded-2xl p-6 sm:grid-cols-2 lg:grid-cols-[auto_repeat(5,1fr)] lg:items-center lg:gap-0 lg:divide-x lg:divide-amber-500/30">
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1 lg:pr-6">
              <Gem className="h-12 w-12 text-amber-400" strokeWidth={1.5} />
              <div>
                <p className="text-gold text-xl font-bold">จุดขายของ CRENIX</p>
                <p className="text-stone-300">(Why CRENIX)</p>
              </div>
            </div>
            {sellingPoints.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 lg:px-5">
                <Icon className="h-9 w-9 shrink-0 text-amber-400" strokeWidth={1.5} />
                <p className="text-sm leading-snug">
                  {text}
                  <br />
                  {sub}
                </p>
              </div>
            ))}
            <div className="flex items-center gap-3 lg:pl-5">
              <InfinityIcon className="h-9 w-9 shrink-0 text-amber-400" strokeWidth={1.5} />
              <p className="text-sm leading-snug">
                ใช้ได้กับหลาย AI
                <br />
                <span className="text-xs text-stone-400">
                  เช่น Midjourney, Runway, Pika, CapCut, Canva และอื่นๆ
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Quick Access ---------- */}
        <section className="mx-auto mt-6 mb-16 max-w-7xl px-4 sm:px-6">
          <div className="gold-card flex flex-col gap-5 rounded-2xl p-6 lg:flex-row lg:items-center">
            <div className="flex shrink-0 items-center gap-3 lg:border-r lg:border-amber-500/30 lg:pr-8">
              <Star className="h-10 w-10 text-amber-400" strokeWidth={1.5} />
              <div>
                <p className="text-gold text-xl font-bold">Quick Access</p>
                <p className="text-stone-300">ทางลัดยอดนิยม</p>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {quickLinks.map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="/prompts"
                  className="gold-outline flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs whitespace-nowrap transition hover:bg-amber-500/10 sm:text-sm"
                >
                  <Icon className="h-5 w-5 shrink-0 text-amber-400" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
