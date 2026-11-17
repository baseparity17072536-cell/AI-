import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { PromptLibrary } from "@/components/library/prompt-library";

export const metadata: Metadata = {
  title: "Prompt Library — CRENIX",
  description:
    "Discover ready-to-use AI prompts and create professional results with CRENIX TECHNOLOGY. เลือก Prompt ที่คุณต้องการ แล้วนำไปใช้งานหรือปรับแต่งเพิ่มเติมได้ทันที",
};

export default function PromptsPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="prompts" />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-12 pb-20 sm:px-6 lg:pt-16">
        {/* Page header */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 text-xs tracking-[0.35em] text-lux-gold sm:text-sm">
            <span className="h-px w-8 bg-lux-gold/60" />
            PROMPT LIBRARY
            <span className="h-px w-8 bg-lux-gold/60" />
          </p>
          <h1 className="mt-4 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl leading-tight font-extrabold text-transparent sm:text-5xl">
            Discover ready-to-use AI prompts
          </h1>
          <p className="mt-3 text-lg text-[#f5f0e6] sm:text-xl">
            and create professional results with CRENIX TECHNOLOGY.
          </p>
          <p className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">
            เลือก Prompt ที่คุณต้องการ แล้วนำไปใช้งานหรือปรับแต่งเพิ่มเติมได้ทันที
          </p>
        </header>

        <section className="mt-10 sm:mt-12" aria-label="รายการ Prompt">
          <PromptLibrary />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
