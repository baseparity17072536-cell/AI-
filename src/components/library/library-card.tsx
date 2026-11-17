"use client";

import Link from "next/link";
import { Eye, Heart, Sparkles } from "lucide-react";
import { PreviewArt } from "./preview-art";
import { StatusBadge, TierBadge } from "./badges";
import { CATEGORY_FILTERS, detailHref, type LibraryPrompt } from "./types";

type Props = {
  item: LibraryPrompt;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function LibraryCard({ item, favorite, onToggleFavorite }: Props) {
  const cat = CATEGORY_FILTERS.find((c) => c.slug === item.category)!;
  const CatIcon = cat.icon;
  const href = detailHref(item);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-lux-gold/25 bg-lux-card transition duration-300 ease-out hover:-translate-y-1 hover:border-lux-bright/60 hover:shadow-[0_14px_40px_-12px_rgba(245,199,107,0.4)]">
      {/* Thumbnail */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] overflow-hidden">
        <div className="h-full w-full transition duration-500 ease-out group-hover:scale-[1.04]">
          <PreviewArt item={item} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-lux-card to-transparent" />
        {item.badges.length > 0 && (
          <span className="absolute bottom-3 left-3 flex gap-1.5">
            {item.badges.map((b) => (
              <StatusBadge key={b} badge={b} />
            ))}
          </span>
        )}
      </Link>

      <div className="absolute top-3 left-3">
        <TierBadge tier={item.tier} />
      </div>

      <button
        type="button"
        onClick={() => onToggleFavorite(item.id)}
        aria-pressed={favorite}
        aria-label={favorite ? `นำ ${item.title} ออกจากรายการโปรด` : `เพิ่ม ${item.title} ในรายการโปรด`}
        className={`absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition hover:scale-110 active:scale-95 ${
          favorite ? "bg-rose-500/90 text-white" : "bg-black/60 text-white hover:text-rose-300"
        }`}
      >
        <Heart className={`h-4.5 w-4.5 ${favorite ? "fill-current" : ""}`} />
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 pt-3">
        <p className="flex items-center gap-1.5 text-xs text-lux-gold">
          <CatIcon className="h-3.5 w-3.5" /> {cat.label}
        </p>
        <h3 className="mt-1.5 text-lg leading-snug font-semibold text-white">
          <Link href={href} className="hover:text-lux-bright focus-visible:text-lux-bright">
            {item.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-400">{item.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="text-[11px] text-stone-500">AI ที่แนะนำ</p>
            <p className="flex items-center gap-1 truncate text-sm font-medium text-stone-200">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-lux-bright" /> {item.recommendedTool}
            </p>
          </div>
          <Link
            href={href}
            className="flex shrink-0 items-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-4 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(245,199,107,0.25)] transition hover:brightness-110 active:scale-95"
          >
            <Eye className="h-4 w-4" /> View Prompt
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LibraryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-lux-gold/15 bg-lux-card" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="flex justify-between pt-4">
          <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
