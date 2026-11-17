import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader />
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-7xl font-extrabold text-transparent">404</p>
        <Compass className="mt-6 h-10 w-10 text-lux-gold" />
        <h1 className="mt-4 text-2xl font-bold text-white">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="mt-2 text-stone-400">ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/prompts" className="rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-3 font-semibold text-black hover:brightness-110">
            ไปที่ Prompt Library
          </Link>
          <Link href="/" className="rounded-full border border-lux-gold/60 px-6 py-3 text-stone-200 hover:bg-lux-gold/10">
            กลับหน้าแรก
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
