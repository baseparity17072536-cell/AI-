import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { BuilderEntry } from "@/components/builder/builder-entry";

export const metadata: Metadata = {
  title: "Interactive Prompt Builder — CRENIX",
  alternates: { canonical: "/builder" },
  description: "ปรับแต่ง Prompt ด้วยการคลิกเลือก โดยไม่ต้องมีความรู้ด้านการเขียน Prompt",
};

export default function BuilderPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="studio" />
      <main className="relative z-10 w-full flex-1 px-4 pt-14 pb-20 sm:px-6">
        {/* BuilderEntry reads ?prompt= with useSearchParams, so it must sit inside Suspense */}
        <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white/5" />}>
          <BuilderEntry />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
