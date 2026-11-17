"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { CopyPromptButton } from "@/components/library/prompt-actions";

type Kind = "content" | "video-editing";
type Result = { text: string; model: string; finish: "completed" | "incomplete" };

/**
 * Sends the built prompt to /api/generate/content (server-side AI) and shows the result.
 * The API key never reaches the browser.
 */
export function AIGenerate({ kind, prompt }: { kind: Kind; prompt: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/generate/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, prompt }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `เกิดข้อผิดพลาด (${res.status})`);
      setResult({ text: data.text, model: data.model, finish: data.finish });
      setStatus("done");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
      setStatus("error");
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crenix-${kind}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-lux-bright/60 bg-linear-to-b from-[#1d1709] to-lux-card p-4" aria-labelledby="ai-gen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="ai-gen" className="flex items-center gap-2 font-bold text-lux-bright">
          <Sparkles className="h-4 w-4" /> สร้างด้วย AI ใน CRENIX
        </h3>
        <span className="rounded-full border border-lux-gold/40 px-2 py-0.5 text-[11px] text-stone-400">ทดลองใช้</span>
      </div>
      <p className="mt-1 text-sm text-stone-400">
        {kind === "content" ? "ให้ AI เขียนคอนเทนต์จาก Prompt ด้านบนให้ทันที" : "ให้ AI วางแผนตัดต่อจาก Prompt ด้านบนให้ทันที"}
      </p>

      {status !== "done" && (
        <button
          type="button"
          onClick={generate}
          disabled={status === "loading" || !prompt.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-5 py-3 font-semibold text-black shadow-[0_0_20px_rgba(245,199,107,0.3)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {status === "loading" ? "AI กำลังเขียน..." : "Generate with AI"}
        </button>
      )}

      {status === "loading" && (
        <div className="mt-3 space-y-2" aria-hidden="true">
          {[90, 75, 85, 60].map((w) => (
            <div key={w} className="h-3 animate-pulse rounded bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {status === "error" && error && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {status === "done" && result && (
        <div className="mt-3">
          <div className="max-h-[28rem] overflow-y-auto rounded-xl bg-lux-ink p-4 leading-relaxed whitespace-pre-line text-stone-100" aria-live="polite">
            {result.text}
          </div>
          {result.finish === "incomplete" && (
            <p className="mt-2 text-xs text-amber-300">ข้อความอาจถูกตัดเพราะยาวเกินขีดจำกัด ลองขอให้สั้นลงแล้วสร้างใหม่</p>
          )}
          <p className="mt-2 text-xs text-stone-500">
            สร้างโดย {result.model} · ตรวจสอบข้อเท็จจริง ราคา และข้อกล่าวอ้างก่อนนำไปใช้
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyPromptButton text={result.text} label="Copy ผลลัพธ์" copiedLabel="คัดลอกแล้ว!" variant="subtle" />
            <button
              type="button"
              onClick={download}
              className="flex items-center gap-1.5 rounded-full border border-lux-gold/50 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:border-lux-bright"
            >
              <Download className="h-3.5 w-3.5" /> ดาวน์โหลด .txt
            </button>
            <button
              type="button"
              onClick={generate}
              className="flex items-center gap-1.5 rounded-full border border-lux-gold/50 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:border-lux-bright"
            >
              <RefreshCw className="h-3.5 w-3.5" /> สร้างใหม่
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
