import { Crown, Flame, Sparkles } from "lucide-react";
import type { Badge, Tier } from "./types";

export function TierBadge({ tier }: { tier: Tier }) {
  return tier === "premium" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-2.5 py-0.5 text-[11px] font-semibold text-black">
      <Crown className="h-3 w-3" /> Premium
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-emerald-400/60 bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur">
      Free
    </span>
  );
}

export function StatusBadge({ badge }: { badge: Badge }) {
  return badge === "popular" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-orange-300 backdrop-blur">
      <Flame className="h-3 w-3" /> Popular
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-sky-300 backdrop-blur">
      <Sparkles className="h-3 w-3" /> New
    </span>
  );
}
