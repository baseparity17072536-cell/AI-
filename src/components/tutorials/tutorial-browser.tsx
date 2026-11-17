"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Clock, Crown, Search, SearchX, X } from "lucide-react";
import { PreviewArt } from "@/components/library/preview-art";
import { ART_COLORS, TUTORIAL_CATEGORIES, TUTORIALS, tutorialCategoryLabel, type TutorialCategory } from "@/data/tutorials";
import { completedStore, toggleCompleted } from "@/lib/tutorial-progress";

export function TutorialBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TutorialCategory | "all">("all");
  const completed = completedStore.use();

  const q = query.trim().toLowerCase();
  const list = TUTORIALS.filter(
    (t) =>
      (category === "all" || t.category === category) &&
      (!q ||
        [t.title, t.summary, tutorialCategoryLabel(t.category), ...t.steps.map((s) => `${s.title} ${s.body}`)].join(" ").toLowerCase().includes(q)),
  );
  const doneCount = TUTORIALS.filter((t) => completed.includes(t.slug)).length;

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-lux-gold" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาบทเรียน เช่น Runway, แคปชัน, มุมกล้อง"
          aria-label="ค้นหาบทเรียน"
          className="w-full rounded-full border border-lux-gold/50 bg-lux-card py-3.5 pr-14 pl-13 text-white placeholder:text-stone-500 focus:border-lux-bright focus:ring-2 focus:ring-lux-bright/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="ล้างคำค้นหา"
            className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="หมวดบทเรียน">
        {[{ id: "all" as const, label: "ทั้งหมด" }, ...TUTORIAL_CATEGORIES].map((c) => {
          const active = category === c.id;
          const n = c.id === "all" ? TUTORIALS.length : TUTORIALS.filter((t) => t.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
                active
                  ? "bg-linear-to-b from-lux-bright to-lux-gold font-semibold text-black"
                  : "border border-lux-gold/40 text-stone-200 hover:border-lux-bright hover:bg-lux-gold/10"
              }`}
            >
              {c.label}
              <span className={`text-xs ${active ? "text-black/60" : "text-stone-500"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-stone-400" aria-live="polite">
        แสดง {list.length} บทเรียน · เรียนจบแล้ว {doneCount}/{TUTORIALS.length}
      </p>

      {list.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-lux-gold/30 bg-lux-card px-6 py-14 text-center">
          <SearchX className="h-10 w-10 text-lux-gold" />
          <p className="mt-4 text-lg font-semibold text-white">ไม่พบบทเรียนที่ตรงกับการค้นหา</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-6 rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const done = completed.includes(t.slug);
            return (
              <Link
                key={t.slug}
                href={`/tutorials/${t.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-lux-gold/25 bg-lux-card transition duration-300 hover:-translate-y-1 hover:border-lux-bright/60 hover:shadow-[0_14px_40px_-12px_rgba(245,199,107,0.4)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <div className="h-full w-full transition duration-500 group-hover:scale-[1.04]">
                    <PreviewArt item={{ category: t.art, title: t.title, preview: ART_COLORS[t.art] }} />
                  </div>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {t.premium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-2.5 py-0.5 text-[11px] font-semibold text-black">
                        <Crown className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {done && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-black">
                        <CheckCircle2 className="h-3 w-3" /> เรียนจบแล้ว
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-lux-gold">{tutorialCategoryLabel(t.category)}</p>
                  <h3 className="mt-1 text-lg leading-snug font-semibold text-white group-hover:text-lux-bright">{t.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-stone-400">{t.summary}</p>
                  <p className="mt-auto flex items-center gap-3 pt-4 text-xs text-stone-500">
                    <span>{t.level}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {t.minutes} นาที
                    </span>
                    {t.sources.length > 0 && <span>อ้างอิงเอกสารทางการ</span>}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MarkCompleteButton({ slug }: { slug: string }) {
  const completed = completedStore.use();
  const done = completed.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => toggleCompleted(slug)}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition ${
        done ? "border border-emerald-400/60 bg-emerald-500/15 text-emerald-300" : "bg-linear-to-b from-lux-bright to-lux-gold text-black hover:brightness-110"
      }`}
    >
      <CheckCircle2 className="h-5 w-5" /> {done ? "เรียนจบแล้ว (กดเพื่อยกเลิก)" : "Mark as Completed"}
    </button>
  );
}
