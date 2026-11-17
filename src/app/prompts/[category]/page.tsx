import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { HowToSteps } from "@/components/how-to-steps";
import { PromptLibrary } from "@/components/library/prompt-library";
import { categories, getCategory } from "@/data/prompts";
import { libraryPrompts } from "@/data/library";
import { PreviewArt } from "@/components/library/preview-art";
import type { CategorySlug } from "@/data/prompts";

/** Gradient behind each category illustration */
const CATEGORY_ART: Record<CategorySlug, { from: string; to: string }> = {
  "video-editing": { from: "#0f172a", to: "#c6a15b" },
  image: { from: "#1c1917", to: "#f5c76b" },
  content: { from: "#151515", to: "#8a6a32" },
  video: { from: "#080808", to: "#c6a15b" },
};

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/prompts/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: `${cat.title} — CRENIX`,
    description: `${cat.titleTh}: ${cat.desc}`,
    alternates: { canonical: `/prompts/${cat.slug}` },
  };
}

export default function CategoryPage({ params }: PageProps<"/prompts/[category]">) {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="prompts" />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* params are read inside Suspense so navigation can show the shell instantly */}
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
          <CategoryContent params={params} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}

async function CategoryContent({ params }: { params: PageProps<"/prompts/[category]">["params"] }) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const Icon = cat.icon;
  const count = libraryPrompts.filter((p) => p.category === cat.slug).length;
  const others = categories.filter((c) => c.slug !== cat.slug);

  return (
    <>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-stone-400">
          <Link href="/" className="hover:text-amber-300">หน้าแรก</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/prompts" className="hover:text-amber-300">Prompt Library</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-stone-200">{cat.title}</span>
        </nav>

        {/* Header with illustration */}
        <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="gold-card grid h-20 w-20 shrink-0 place-items-center rounded-2xl">
              <Icon className="h-11 w-11 text-amber-400" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="text-gold text-3xl font-extrabold sm:text-5xl">{cat.title}</h1>
              <p className="mt-1 text-lg">{cat.titleTh}</p>
              <p className="mt-1 text-stone-400">{cat.desc}</p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-lux-gold/40 bg-lux-gold/10 px-3 py-1 text-sm text-lux-bright">
                {count} Prompt ในหมวดนี้
              </p>
            </div>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-lux-gold/30">
            <PreviewArt item={{ category: cat.slug, title: cat.title, preview: CATEGORY_ART[cat.slug] }} />
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] text-stone-300 backdrop-blur">
              ภาพประกอบ
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-stone-400">ใช้ได้กับ:</span>
          {cat.tools.map((t) => (
            <span key={t} className="gold-outline rounded-full px-3 py-1 text-stone-200">{t}</span>
          ))}
        </div>

        {/* How-to + tips */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <section aria-labelledby="howto">
            <h2 id="howto" className="mb-3 text-lg font-bold">วิธีใช้</h2>
            <HowToSteps />
          </section>
          <section aria-labelledby="tips" className="gold-card rounded-2xl p-5">
            <h2 id="tips" className="flex items-center gap-2 font-bold">
              <Lightbulb className="h-5 w-5 text-amber-400" /> เคล็ดลับ
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
              {cat.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10" aria-label={`รายการ ${cat.title}`}>
          <h2 className="mb-4 text-xl font-bold">
            Prompt ในหมวดนี้ <span className="text-stone-400">({count})</span>
          </h2>
          <PromptLibrary lockedCategory={cat.slug} />
        </section>

        {/* Other categories */}
        <section className="mt-14" aria-labelledby="others">
          <h2 id="others" className="mb-4 text-xl font-bold">ดูหมวดอื่น</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {others.map(({ slug, title, titleTh, icon: OIcon }) => (
              <Link
                key={slug}
                href={`/prompts/${slug}`}
                className="gold-card flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5"
              >
                <OIcon className="h-8 w-8 shrink-0 text-amber-400" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-xs text-stone-400">{titleTh}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
    </>
  );
}
