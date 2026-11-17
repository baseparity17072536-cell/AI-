import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Clock, Heart, ShieldCheck, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Account — CRENIX",
  description: "ระบบสมาชิก CRENIX TECHNOLOGY",
  robots: { index: false },
};

/**
 * Honest status page for Log In / Sign Up until real authentication exists (Step 10).
 * Deliberately has no login form: a form without real auth behind it would be fake.
 */
export default function AccountPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 pt-16 pb-20 sm:px-6">
        <div className="rounded-3xl border border-lux-gold/40 bg-lux-card p-8 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lux-gold/10">
            <UserRound className="h-8 w-8 text-lux-bright" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">ระบบสมาชิกกำลังเปิดให้บริการเร็ว ๆ นี้</h1>
          <p className="mt-3 leading-relaxed text-stone-300">
            ตอนนี้ยังไม่ต้องสมัครสมาชิก คุณใช้ CRENIX ได้ทันที ข้อมูลที่บันทึกจะเก็บไว้ในเบราว์เซอร์นี้
          </p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-stone-300">
            <li className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-lux-gold" /> รายการโปรด
            </li>
            <li className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-lux-gold" /> Prompt ที่บันทึกและสร้างเอง
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-lux-gold" /> ประวัติการใช้งานและโปรเจกต์ Long Video Planner
            </li>
          </ul>
          <p className="mx-auto mt-6 flex max-w-md items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs leading-relaxed text-stone-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lux-gold" />
            ข้อมูลในเบราว์เซอร์จะหายถ้าล้างข้อมูลเว็บไซต์ หรือเปิดจากอุปกรณ์อื่น เมื่อระบบสมาชิกเปิดใช้ จะย้ายข้อมูลเข้าบัญชีของคุณได้
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/my-prompts" className="rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-3 font-semibold text-black hover:brightness-110">
              ไปที่ My Prompts
            </Link>
            <Link href="/pricing" className="rounded-full border border-lux-gold/60 px-6 py-3 text-stone-200 hover:bg-lux-gold/10">
              ดูแพ็กเกจ
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
