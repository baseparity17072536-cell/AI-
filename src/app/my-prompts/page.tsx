import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { MyPrompts } from "@/components/my-prompts/my-prompts";

export const metadata: Metadata = {
  title: "My Prompts — CRENIX",
  description: "จัดเก็บ ค้นหา แก้ไข และจัดหมวดหมู่ Prompt ของคุณ",
  robots: { index: false },
};

export default function MyPromptsPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="my-prompts" />
      <main className="relative z-10 w-full flex-1 px-4 pt-12 pb-20 sm:px-6">
        <MyPrompts />
      </main>
      <SiteFooter />
    </div>
  );
}
