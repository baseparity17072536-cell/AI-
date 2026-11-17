"use client";

import { useFavorites } from "@/lib/favorites";
import { LibraryCard } from "./library-card";
import type { LibraryPrompt } from "./types";

export function RelatedPrompts({ items }: { items: LibraryPrompt[] }) {
  const { ids, toggle } = useFavorites();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <LibraryCard key={p.id} item={p} favorite={ids.includes(p.id)} onToggleFavorite={toggle} />
      ))}
    </div>
  );
}
