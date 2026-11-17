"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, Check, Copy, Heart } from "lucide-react";
import Link from "next/link";
import { copyText } from "@/components/prompt-card";
import { useFavorites } from "@/lib/favorites";
import { savePrompt, trackRecent } from "@/lib/my-prompts";
import type { CategorySlug } from "@/data/prompts";

type CopyProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "subtle";
  className?: string;
  /** Library prompt id: records the copy in "Recently Used" */
  trackId?: string;
};

/** Copies `text` to the clipboard and shows a short confirmation. */
export function CopyPromptButton({
  text,
  label = "Copy Prompt",
  copiedLabel = "คัดลอกแล้ว!",
  variant = "primary",
  className = "",
  trackId,
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyText(text)) {
      if (trackId) trackRecent("library", trackId, "copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const styles =
    variant === "primary"
      ? copied
        ? "bg-emerald-500 text-black"
        : "bg-linear-to-b from-lux-bright to-lux-gold text-black shadow-[0_0_20px_rgba(245,199,107,0.3)] hover:brightness-110"
      : copied
        ? "border-emerald-400 text-emerald-300"
        : "border-lux-gold/50 text-stone-200 hover:border-lux-bright hover:text-white";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={`flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] ${
        variant === "primary" ? "px-5 py-3" : "border px-3 py-1.5 text-xs"
      } ${styles} ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </button>
  );
}

/** Save / remove a prompt from favorites (stored in localStorage). */
export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const { ids, toggle } = useFavorites();
  const favorite = ids.includes(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={favorite}
      className={`flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium transition active:scale-[0.98] ${
        favorite
          ? "border-rose-400 bg-rose-500/15 text-rose-300"
          : "border-lux-gold/60 text-stone-200 hover:bg-lux-gold/10"
      } ${className}`}
    >
      <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
      {favorite ? "Saved to Favorites" : "Save Favorite"}
    </button>
  );
}

/** Records a library prompt view in "Recently Used" (renders nothing). */
export function TrackView({ id }: { id: string }) {
  useEffect(() => {
    trackRecent("library", id, "view");
  }, [id]);
  return null;
}

/** Saves an editable copy of a library prompt into My Prompts. */
export function SaveCopyButton({
  item,
  className = "",
}: {
  item: { id: string; title: string; category: CategorySlug; promptEn: string; promptTh: string };
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          savePrompt({
            title: item.title,
            category: item.category,
            promptEn: item.promptEn,
            promptTh: item.promptTh,
            source: { type: "library", libraryId: item.id },
          });
          setSaved(true);
        }}
        disabled={saved}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-lux-gold/60 px-5 py-3 font-medium text-stone-200 transition hover:bg-lux-gold/10 disabled:border-emerald-400/60 disabled:text-emerald-300"
      >
        {saved ? <Check className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
        {saved ? "บันทึกใน My Prompts แล้ว" : "Save to My Prompts"}
      </button>
      {saved && (
        <Link href="/my-prompts" className="mt-1 block text-center text-xs text-emerald-300 underline">
          เปิด My Prompts
        </Link>
      )}
    </div>
  );
}
