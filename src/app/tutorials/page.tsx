import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { TutorialBrowser } from "@/components/tutorials/tutorial-browser";

export const metadata: Metadata = {
  title: "Tutorials — CRENIX",
  alternates: { canonical: "/tutorials" },
  description: "คู่มือใช้ AI Prompt และ AI Platform ตั้งแต่มือใหม่ถึงมืออาชีพ: Runway, Pika, Adobe Firefly, Canva AI พร้อมแหล่งอ้างอิงเอกสารทางการ",
};

export default function TutorialsPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="tutorials" />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-12 pb-20 sm:px-6 lg:pt-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 text-xs tracking-[0.35em] text-lux-gold sm:text-sm">
            <span className="h-px w-8 bg-lux-gold/60" />
            TUTORIALS
            <span className="h-px w-8 bg-lux-gold/60" />
          </p>
          <h1 className="mt-4 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl leading-tight font-extrabold text-transparent sm:text-5xl">
            Learn AI Prompts, step by step
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">
            คู่มือใช้ Prompt และ AI Platform สำหรับมือใหม่จนถึงมืออาชีพ ข้อมูลแพลตฟอร์มอ้างอิงจากเอกสารทางการ พร้อมวันที่ตรวจสอบ
          </p>
        </header>
        <section className="mt-10 sm:mt-12" aria-label="รายการบทเรียน">
          <TutorialBrowser />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
