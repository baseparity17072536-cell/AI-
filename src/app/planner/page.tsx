import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { LongVideoPlanner } from "@/components/planner/long-video-planner";

export const metadata: Metadata = {
  title: "Long Video Planner — CRENIX",
  alternates: { canonical: "/planner" },
  description: "วางแผนวิดีโอยาว 1–20 นาที แบ่งเป็นฉากและคลิปสั้นตามขีดจำกัดของ AI พร้อม Prompt ภาษาอังกฤษและคำแปลไทยทุกฉาก",
};

export default function PlannerPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="studio" />
      <main className="relative z-10 w-full flex-1 px-4 pt-12 pb-20 sm:px-6">
        {/* The planner reads ?total= from the Prompt Builder via useSearchParams, so it sits inside Suspense */}
        <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-white/5" />}>
          <LongVideoPlanner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
