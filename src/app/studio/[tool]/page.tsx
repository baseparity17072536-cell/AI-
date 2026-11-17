import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Plug } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { TOOL_ICONS } from "@/components/studio/tool-grid";
import { StatusBadgeSkeleton, statusHint, ToolStatusBadge } from "@/components/studio/tool-status";
import { getStudioTool, STUDIO_TOOLS } from "@/data/studio-tools";
import { getToolStatuses } from "@/server/ai/status";

type Props = PageProps<"/studio/[tool]">;

/** Content has its own page (/studio/content); these are the remaining studios. */
const TOOL_PAGES = STUDIO_TOOLS.filter((t) => t.id !== "content");

export function generateStaticParams() {
  return TOOL_PAGES.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const t = getStudioTool(tool);
  return t ? { title: `${t.name} — CRENIX`, description: t.desc, alternates: { canonical: t.href } } : {};
}

export default function StudioToolPage({ params }: Props) {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="studio" />
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-20 sm:px-6">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
          <ToolDetail params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function ToolDetail({ params }: { params: Props["params"] }) {
  const { tool } = await params;
  const t = TOOL_PAGES.find((x) => x.id === tool);
  if (!t) notFound();
  const Icon = TOOL_ICONS[t.id];

  return (
    <>
      <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-lux-gold hover:text-lux-bright">
        <ArrowLeft className="h-4 w-4" /> กลับไป Creative Dashboard
      </Link>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-lux-gold/40 bg-linear-to-b from-lux-gold/20 to-transparent text-lux-bright">
          <Icon className="h-10 w-10" strokeWidth={1.5} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              {t.name}
            </h1>
            <Suspense fallback={<StatusBadgeSkeleton />}>
              <LiveStatus id={t.id} />
            </Suspense>
          </div>
          <p className="mt-1 text-lux-gold">{t.th}</p>
          <p className="mt-1 text-stone-400">{t.desc}</p>
        </div>
      </header>

      {/* Honest state: no generate button until the integration exists */}
      <section className="mt-8 rounded-3xl border border-lux-gold/40 bg-linear-to-b from-[#1d1709] to-lux-card p-6 sm:p-8" aria-labelledby="status-h">
        <h2 id="status-h" className="flex items-center gap-2 text-lg font-bold text-white">
          <Clock className="h-5 w-5 text-lux-bright" /> ยังสร้างผลงานในเครื่องมือนี้ไม่ได้
        </h2>
        <p className="mt-2 leading-relaxed text-stone-300">
          {t.name} อยู่ระหว่างพัฒนาและยังไม่ได้เชื่อมต่อกับผู้ให้บริการ AI — เมื่อเชื่อมต่อแล้ว ปุ่มสร้างผลงานจะแสดงที่หน้านี้
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-stone-400">ความสามารถที่วางแผนไว้</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-200">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lux-gold" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-400">ผู้ให้บริการที่วางแผนไว้</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-200">
              {t.plannedProviders.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Plug className="mt-0.5 h-4 w-4 shrink-0 text-lux-gold" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {t.availableNow.length > 0 && (
        <section className="mt-8" aria-labelledby="now-h">
          <h2 id="now-h" className="text-lg font-bold text-white">
            สิ่งที่ทำได้แล้วตอนนี้
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {t.availableNow.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-lux-gold/25 bg-lux-card p-4 text-stone-200 transition hover:border-lux-bright/60 hover:bg-lux-gold/5"
              >
                {a.label}
                <ArrowRight className="h-4 w-4 shrink-0 text-lux-bright" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

async function LiveStatus({ id }: { id: (typeof STUDIO_TOOLS)[number]["id"] }) {
  const status = (await getToolStatuses())[id];
  return (
    <span className="flex items-center gap-2">
      <ToolStatusBadge status={status} />
      <span className="sr-only">{statusHint(status)}</span>
    </span>
  );
}
