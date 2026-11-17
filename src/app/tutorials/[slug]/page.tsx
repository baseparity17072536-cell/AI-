import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, ChevronRight, Clock, Crown, ExternalLink, Lightbulb, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { PreviewArt } from "@/components/library/preview-art";
import { RelatedPrompts } from "@/components/library/related-prompts";
import { MarkCompleteButton } from "@/components/tutorials/tutorial-browser";
import { getLibraryPrompt } from "@/data/library";
import { ART_COLORS, getTutorial, relatedTutorials, TUTORIALS, tutorialCategoryLabel } from "@/data/tutorials";
import { getCurrentPlan } from "@/lib/account";
import { can } from "@/lib/plans";

type Props = PageProps<"/tutorials/[slug]">;

export function generateStaticParams() {
  return TUTORIALS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTutorial(slug);
  return t
    ? { title: `${t.title} — CRENIX Tutorials`, description: t.summary, alternates: { canonical: `/tutorials/${t.slug}` } }
    : {};
}

export default function TutorialPage({ params }: Props) {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="tutorials" />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-20 sm:px-6">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
          <TutorialDetail params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function TutorialDetail({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const t = getTutorial(slug);
  if (!t) notFound();

  // Ready for Premium Tutorials; only blocks once ENFORCE_PERMISSIONS is on (needs real accounts)
  const locked = t.premium && !can(getCurrentPlan(), "premium-tutorials");
  const prompts = t.recommendedPrompts.map(getLibraryPrompt).filter((p) => p !== undefined);
  const related = relatedTutorials(t);
  const checked = new Date(t.checkedAt).toLocaleDateString("th-TH", { dateStyle: "long" });

  return (
    <>
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
        <Link href="/" className="hover:text-lux-bright">หน้าแรก</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/tutorials" className="hover:text-lux-bright">Tutorials</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-stone-200">{tutorialCategoryLabel(t.category)}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-lux-gold/30">
            <PreviewArt item={{ category: t.art, title: t.title, preview: ART_COLORS[t.art] }} />
            <span className="absolute right-4 bottom-4 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] text-stone-300 backdrop-blur">ภาพประกอบ</span>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-lux-gold">
            {tutorialCategoryLabel(t.category)}
            {t.premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-2.5 py-0.5 text-[11px] font-semibold text-black">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
          </p>
          <h1 className="mt-1 text-3xl leading-tight font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-stone-300">{t.summary}</p>
          <p className="mt-3 flex flex-wrap gap-4 text-sm text-stone-500">
            <span>{t.level}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {t.minutes} นาที
            </span>
            <span>ตรวจสอบข้อมูลเมื่อ {checked}</span>
          </p>

          {locked ? (
            <div className="mt-8 rounded-2xl border border-lux-gold/40 bg-lux-card p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-lux-gold" />
              <p className="mt-3 font-semibold text-white">บทเรียนนี้สำหรับสมาชิก Premium</p>
              <Link href="/pricing" className="mt-5 inline-block rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">
                ดูแพ็กเกจ
              </Link>
            </div>
          ) : (
            <>
              <section className="mt-8" aria-labelledby="steps">
                <h2 id="steps" className="flex items-center gap-2 text-xl font-bold text-white">
                  <BookOpenCheck className="h-5 w-5 text-lux-gold" /> ขั้นตอน
                </h2>
                <ol className="mt-4 space-y-4">
                  {t.steps.map((s, i) => (
                    <li key={s.title} className="flex gap-4 rounded-2xl border border-lux-gold/20 bg-lux-card p-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lux-gold font-bold text-black">{i + 1}</span>
                      <div>
                        <h3 className="font-semibold text-white">{s.title}</h3>
                        <p className="mt-1 leading-relaxed text-stone-300">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              {t.tips && (
                <section className="mt-6 rounded-2xl border border-lux-gold/30 bg-lux-gold/5 p-5" aria-labelledby="tips">
                  <h2 id="tips" className="flex items-center gap-2 font-bold text-white">
                    <Lightbulb className="h-5 w-5 text-lux-bright" /> เคล็ดลับ
                  </h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-300">
                    {t.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          <section className="mt-6 rounded-2xl border border-white/10 bg-lux-card p-5 text-sm" aria-labelledby="sources">
            <h2 id="sources" className="font-semibold text-white">แหล่งอ้างอิง</h2>
            {t.sources.length ? (
              <>
                <ul className="mt-2 space-y-1.5">
                  {t.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-lux-gold hover:text-lux-bright hover:underline">
                        {s.label} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-stone-500">
                  ตรวจสอบเมื่อ {checked} — แพลตฟอร์ม AI อัปเดตบ่อย เมนูและข้อจำกัดอาจเปลี่ยน ให้ตรวจกับเอกสารทางการก่อนใช้งานจริง
                </p>
              </>
            ) : (
              <p className="mt-2 text-stone-400">บทเรียนนี้เป็นคำแนะนำทั่วไป ไม่ได้อ้างอิงความสามารถของแพลตฟอร์มใดโดยเฉพาะ</p>
            )}
          </section>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <MarkCompleteButton slug={t.slug} />
          {related.length > 0 && (
            <div className="rounded-2xl border border-lux-gold/25 bg-lux-card p-5">
              <h2 className="font-semibold text-white">Related Tutorials</h2>
              <ul className="mt-3 space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/tutorials/${r.slug}`} className="block rounded-xl p-2 transition hover:bg-lux-gold/10">
                      <span className="block text-xs text-lux-gold">{tutorialCategoryLabel(r.category)}</span>
                      <span className="block text-sm text-stone-200">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {prompts.length > 0 && (
        <section className="mt-14" aria-labelledby="rec">
          <h2 id="rec" className="mb-5 text-2xl font-bold text-white">Recommended Prompts</h2>
          <RelatedPrompts items={prompts} />
        </section>
      )}

      <Link href="/tutorials" className="mt-12 inline-flex items-center gap-2 text-lux-gold hover:text-lux-bright">
        <ArrowLeft className="h-4 w-4" /> กลับไปที่ Tutorials
      </Link>
    </>
  );
}
