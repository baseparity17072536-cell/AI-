"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Film, Heart, Sparkles, Trash2 } from "lucide-react";
import { CopyPromptButton } from "@/components/library/prompt-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CREATION_LABEL, creationsStore, deleteCreation, type Creation } from "@/lib/creations";
import { savedStore } from "@/lib/my-prompts";
import { projectsStore } from "@/lib/planner/store";
import { favoritesStore } from "@/lib/favorites";
import { formatDuration } from "@/lib/planner/engine";

/** Real creations only — generated successfully through a connected studio. */
export function RecentCreations() {
  const creations = creationsStore.use();
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Creation | null>(null);
  const recent = creations.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-lux-gold/30 bg-lux-card p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-lux-gold" />
        <p className="mt-3 font-semibold text-white">ยังไม่มีผลงาน</p>
        <p className="mt-1 text-sm text-stone-400">ผลงานที่สร้างสำเร็จด้วย AI จะแสดงที่นี่ (บันทึกในเบราว์เซอร์นี้)</p>
        <Link href="/studio/content" className="mt-5 inline-block rounded-full bg-lux-gold px-5 py-2.5 text-sm font-semibold text-black">
          ลองสร้างคอนเทนต์
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {recent.map((c) => {
          const expanded = open === c.id;
          return (
            <li key={c.id} className="flex flex-col rounded-2xl border border-lux-gold/25 bg-lux-card p-4">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="rounded-full bg-lux-gold/15 px-2.5 py-0.5 font-semibold text-lux-bright">{CREATION_LABEL[c.kind]}</span>
                <span className="text-stone-500">
                  {new Date(c.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : c.id)}
                aria-expanded={expanded}
                className={`mt-3 rounded-xl bg-lux-ink p-3 text-left text-sm leading-relaxed text-stone-200 ${expanded ? "whitespace-pre-line" : "line-clamp-4"}`}
              >
                {c.output}
              </button>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-stone-500">{c.model}</span>
                <div className="flex gap-2">
                  <CopyPromptButton text={c.output} label="Copy" variant="subtle" />
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    aria-label="ลบผลงาน"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-stone-400 hover:border-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={toDelete !== null}
        title="ลบผลงานนี้?"
        message="ผลงานจะถูกลบออกจากเบราว์เซอร์นี้และกู้คืนไม่ได้"
        confirmLabel="ลบผลงาน"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteCreation(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}

/** Summary of the user's real saved work (no placeholder numbers). */
export function MyProjectsSummary() {
  const projects = projectsStore.use();
  const saved = savedStore.use();
  const favorites = favoritesStore.use();
  const latest = projects.slice(0, 3);

  const stats = [
    { icon: Film, label: "Video Projects", value: projects.length, href: "/planner" },
    { icon: Bookmark, label: "Saved Prompts", value: saved.length, href: "/my-prompts" },
    { icon: Heart, label: "Favorites", value: favorites.length, href: "/my-prompts" },
  ];

  return (
    <div className="rounded-2xl border border-lux-gold/25 bg-lux-card p-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-white/5 bg-lux-ink p-3 text-center transition hover:border-lux-gold/40">
            <Icon className="mx-auto h-5 w-5 text-lux-gold" />
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-stone-400">{label}</p>
          </Link>
        ))}
      </div>
      {latest.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {latest.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-lux-ink px-3 py-2 text-sm">
              <span className="truncate text-stone-200">{p.title}</span>
              <span className="shrink-0 text-xs text-stone-500">
                {formatDuration(p.totalSeconds)} · {p.scenes.length} ฉาก
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-center text-sm text-stone-500">ยังไม่มีโปรเจกต์วิดีโอ — เริ่มได้ที่ Long Video Planner</p>
      )}
    </div>
  );
}
