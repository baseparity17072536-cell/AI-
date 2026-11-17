import { Suspense } from "react";
import type { Metadata } from "next";
import { KeyRound, PauseCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { ContentStudio } from "@/components/studio/content-studio";
import { getToolStatuses } from "@/server/ai/status";

export const metadata: Metadata = {
  title: "AI Content Studio — CRENIX",
  description: "สร้าง Caption, Sales Copy, Storytelling, Script และบทความด้วย AI ใน CRENIX",
  alternates: { canonical: "/studio/content" },
};

export default function ContentStudioPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="studio" />
      <main className="relative z-10 w-full flex-1 px-4 pt-10 pb-20 sm:px-6">
        <Suspense fallback={null}>
          <ConnectionNotice />
        </Suspense>
        <ContentStudio />
      </main>
      <SiteFooter />
    </div>
  );
}

/** Tells the truth before the user tries to generate. */
async function ConnectionNotice() {
  const { content } = await getToolStatuses();
  if (content === "connected") return null;
  const needsKey = content === "needs-key";
  return (
    <div className="mx-auto mb-6 flex max-w-7xl items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200" role="status">
      {needsKey ? <KeyRound className="mt-0.5 h-5 w-5 shrink-0" /> : <PauseCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <p>
        <b className="text-amber-100">Not Connected — </b>
        {needsKey
          ? "ยังไม่ได้ตั้งค่า API key ของ AI บน server จึงยังสร้างคอนเทนต์ไม่ได้ (ยังสร้าง Prompt และคัดลอกไปใช้ได้ตามปกติ)"
          : "การสร้างด้วย AI ปิดไว้ชั่วคราวจนกว่าระบบสมาชิกและเครดิตจะพร้อม (ยังสร้าง Prompt และคัดลอกไปใช้ได้)"}
      </p>
    </div>
  );
}
