"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Hook point for an error reporting service later
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center bg-lux-ink px-4 py-24 text-center text-stone-100">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-500/15">
        <AlertTriangle className="h-8 w-8 text-rose-300" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-white">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="mt-2 text-stone-400">ลองใหม่อีกครั้ง หากยังไม่ได้ ให้กลับไปหน้าแรก ข้อมูลที่บันทึกไว้ของคุณยังอยู่ครบ</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-3 font-semibold text-black hover:brightness-110"
        >
          <RefreshCw className="h-4 w-4" /> ลองอีกครั้ง
        </button>
        <Link href="/" className="rounded-full border border-lux-gold/60 px-6 py-3 text-stone-200 hover:bg-lux-gold/10">
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
