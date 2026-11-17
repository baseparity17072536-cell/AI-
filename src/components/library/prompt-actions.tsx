"use client";

import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { copyText } from "@/components/prompt-card";
import { useFavorites } from "@/lib/favorites";

type CopyProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "subtle";
  className?: string;
};

/** Copies `text` to the clipboard and shows a short confirmation. */
export function CopyPromptButton({
  text,
  label = "Copy Prompt",
  copiedLabel = "คัดลอกแล้ว!",
  variant = "primary",
  className = "",
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyText(text)) {
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
