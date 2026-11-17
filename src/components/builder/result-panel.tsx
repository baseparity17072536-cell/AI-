"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  ExternalLink,
  Film,
  Info,
  Languages,
  Mic,
  PencilLine,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { CopyPromptButton } from "@/components/library/prompt-actions";
import { STATUS_LABEL, type CapStatus, type PlatformProfile } from "@/data/builder/platforms";
import type { BuildResult, CompatRow } from "@/lib/builder/engine";
import { AIGenerate } from "./ai-generate";

type Props = {
  result: BuildResult;
  platform: PlatformProfile;
  stale: boolean;
  editable: boolean;
  en: string;
  onEnChange: (v: string) => void;
  onSave: (title: string) => void;
  savedTitle: string | null;
  defaultTitle: string;
  onEdit: () => void;
  onGenerateAgain: () => void;
  onReset: () => void;
  plannerHref?: string;
  /** Text categories can be generated with AI directly in CRENIX */
  aiKind?: "content" | "video-editing";
};

const btnOutline =
  "flex items-center justify-center gap-2 rounded-full border border-lux-gold/50 px-4 py-2.5 text-sm font-medium text-stone-200 transition hover:border-lux-bright hover:bg-lux-gold/10";

export function ResultPanel(p: Props) {
  const { result, platform } = p;
  const [title, setTitle] = useState(p.defaultTitle);

  return (
    <div className="space-y-5">
      {p.stale && (
        <p className="flex items-start gap-2 rounded-xl border border-lux-bright/50 bg-lux-gold/10 px-4 py-3 text-sm text-lux-bright" role="status">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
          ตัวเลือกเปลี่ยนแล้ว กด Generate Again เพื่ออัปเดต Prompt
        </p>
      )}

      {/* English */}
      <section aria-labelledby="res-en">
        <div className="flex items-center justify-between gap-3">
          <h3 id="res-en" className="flex items-center gap-2 font-bold text-lux-bright">
            <Sparkles className="h-4 w-4" /> English Prompt
          </h3>
          <CopyPromptButton text={p.en} label="Copy English" variant="subtle" />
        </div>
        {p.editable ? (
          <>
            <textarea
              value={p.en}
              onChange={(e) => p.onEnChange(e.target.value)}
              rows={7}
              aria-label="แก้ไข English Prompt"
              className="mt-2 w-full resize-y rounded-2xl border border-lux-gold/40 bg-lux-ink p-4 leading-relaxed text-stone-100 focus:border-lux-bright focus:outline-none"
            />
            <p className="mt-1 text-xs text-stone-500">Advanced: แก้ข้อความได้โดยตรง (คำแปลไทยจะไม่เปลี่ยนตาม)</p>
          </>
        ) : (
          <p className="mt-2 rounded-2xl border border-white/10 bg-lux-ink p-4 leading-relaxed whitespace-pre-line text-stone-100">{p.en}</p>
        )}
      </section>

      {p.aiKind && <AIGenerate kind={p.aiKind} prompt={p.en} />}

      {/* Thai */}
      <section aria-labelledby="res-th">
        <div className="flex items-center justify-between gap-3">
          <h3 id="res-th" className="flex items-center gap-2 font-bold text-white">
            <Languages className="h-4 w-4 text-lux-gold" /> คำแปลภาษาไทย
          </h3>
          <CopyPromptButton text={result.th} label="Copy Thai" variant="subtle" />
        </div>
        <p className="mt-2 rounded-2xl border border-white/10 bg-lux-ink p-4 leading-relaxed whitespace-pre-line text-stone-300">{result.th}</p>
      </section>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <ul className="space-y-2" aria-label="คำแนะนำ">
          {result.warnings.map((w, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-relaxed ${
                w.level === "warn" ? "border border-amber-400/40 bg-amber-500/10 text-amber-200" : "border border-white/10 bg-white/5 text-stone-300"
              }`}
            >
              {w.level === "warn" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
              {w.text}
            </li>
          ))}
        </ul>
      )}

      {result.planner && p.plannerHref && (
        <Link
          href={p.plannerHref}
          className="flex items-center justify-between gap-3 rounded-2xl border border-lux-bright/60 bg-lux-gold/10 p-4 transition hover:bg-lux-gold/20"
        >
          <span className="flex items-center gap-3">
            <Film className="h-6 w-6 shrink-0 text-lux-bright" />
            <span>
              <span className="block font-semibold text-white">เปิด Long Video Planner</span>
              <span className="text-sm text-stone-400">
                แบ่งเป็นประมาณ {result.planner.clips} คลิป คลิปละ {result.planner.clipSeconds} วินาที
              </span>
            </span>
          </span>
          <ExternalLink className="h-4 w-4 text-lux-bright" />
        </Link>
      )}

      {result.voiceScript && (
        <section className="rounded-2xl border border-lux-gold/30 bg-lux-card p-4">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Mic className="h-4 w-4 text-lux-gold" /> บทเสียงบรรยาย (สร้างแยก)
          </h3>
          <p className="mt-1 text-sm text-stone-400">
            ภาษา: {result.voiceScript.language}
            {result.voiceScript.character && ` · ลักษณะเสียง: ${result.voiceScript.character}`}
          </p>
          {result.voiceScript.text ? (
            <>
              <p className="mt-3 rounded-xl bg-lux-ink p-3 whitespace-pre-line text-stone-200">{result.voiceScript.text}</p>
              <CopyPromptButton text={result.voiceScript.text} label="Copy บทพูด" variant="subtle" className="mt-2" />
            </>
          ) : (
            <p className="mt-2 text-sm text-stone-500">ยังไม่ได้พิมพ์บทพูด</p>
          )}
          <p className="mt-3 text-xs text-stone-500">นำบทนี้ไปสร้างเสียงด้วยเครื่องมือ Text-to-Speech ที่รองรับภาษาที่เลือก หรืออัดเสียงเอง แล้วใส่ตอนตัดต่อ</p>
        </section>
      )}

      {/* Actions */}
      <div className="rounded-2xl border border-lux-gold/30 bg-lux-card p-4">
        <label htmlFor="save-title" className="text-sm text-stone-400">
          ชื่อ Prompt สำหรับบันทึก
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="save-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-lux-gold/35 bg-lux-ink px-4 py-2.5 text-white focus:border-lux-bright focus:outline-none"
          />
          <button
            type="button"
            onClick={() => p.onSave(title)}
            className="flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-5 py-2.5 font-semibold text-black transition hover:brightness-110"
          >
            {p.savedTitle ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            {p.savedTitle ? "บันทึกแล้ว" : "Save to My Prompts"}
          </button>
        </div>
        {p.savedTitle && (
          <p className="mt-2 text-sm text-emerald-300" role="status">
            บันทึก “{p.savedTitle}” แล้ว ·{" "}
            <Link href="/my-prompts" className="underline hover:text-emerald-200">
              ดูใน My Prompts
            </Link>
          </p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" onClick={p.onEdit} className={btnOutline}>
            <PencilLine className="h-4 w-4" /> Edit Selections
          </button>
          <button type="button" onClick={p.onGenerateAgain} className={btnOutline}>
            <RefreshCw className="h-4 w-4" /> Generate Again
          </button>
          <button type="button" onClick={p.onReset} className={`${btnOutline} hover:border-rose-400 hover:text-rose-200`}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Summary */}
      <section className="rounded-2xl border border-white/10 bg-lux-card p-4">
        <h3 className="font-semibold text-white">Settings Summary</h3>
        {result.summary.length ? (
          <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            {result.summary.map((s) => (
              <div key={s.label} className="flex min-w-0 justify-between gap-3 border-b border-white/5 pb-1.5">
                <dt className="shrink-0 text-stone-400">{s.label}</dt>
                <dd className="truncate text-right text-white" title={s.value}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-stone-500">ยังไม่ได้เลือกตัวเลือก</p>
        )}
      </section>

      <PlatformCompat platform={platform} rows={result.compatibility} />
    </div>
  );
}

export function StatusPill({ status }: { status: CompatRow["status"] }) {
  const map: Record<CompatRow["status"], [string, string]> = {
    verified: [STATUS_LABEL.verified, "border-emerald-400/50 text-emerald-300"],
    "not-verified": [STATUS_LABEL["not-verified"], "border-amber-400/50 text-amber-300"],
    unknown: [STATUS_LABEL.unknown, "border-stone-500/60 text-stone-400"],
    ok: ["OK", "border-emerald-400/50 text-emerald-300"],
    issue: ["ต้องปรับ", "border-rose-400/60 text-rose-300"],
  };
  const [label, cls] = map[status];
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function PlatformCompat({ platform, rows }: { platform: PlatformProfile; rows: CompatRow[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-lux-card p-4">
      <h3 className="font-semibold text-white">Platform Compatibility · {platform.name}</h3>
      <p className="text-xs text-stone-500">
        {platform.model} · ตรวจสอบข้อมูลเมื่อ {new Date(platform.checkedAt).toLocaleDateString("th-TH", { dateStyle: "medium" })}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
            <span className="min-w-0">
              <span className="block text-stone-200">{r.label}</span>
              <span className="block text-xs text-stone-500">{r.detail}</span>
            </span>
            <StatusPill status={r.status as CapStatus} />
          </li>
        ))}
      </ul>
      {platform.sources.length > 0 && (
        <div className="mt-3 text-xs text-stone-500">
          แหล่งอ้างอิง:
          <ul className="mt-1 space-y-1">
            {platform.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-lux-gold hover:text-lux-bright hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
