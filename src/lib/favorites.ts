"use client";

import { useCallback } from "react";
import { arrayOf, createStore, storageKey } from "./local-store";

const isString = (x: unknown): x is string => typeof x === "string";

export const favoritesStore = createStore<string[]>("favorites", [], arrayOf(isString));

/** One-time move from the pre-account key ("crenix:favorites") to the per-user key. */
function migrateLegacy() {
  try {
    const legacy = localStorage.getItem("crenix:favorites");
    if (legacy !== null && localStorage.getItem(storageKey("favorites")) === null) {
      localStorage.setItem(storageKey("favorites"), legacy);
    }
    if (legacy !== null) localStorage.removeItem("crenix:favorites");
  } catch {
    /* storage unavailable */
  }
}
if (typeof window !== "undefined") migrateLegacy();

export function useFavorites() {
  const ids = favoritesStore.use();
  const toggle = useCallback((id: string) => {
    favoritesStore.set((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);
  return { ids, toggle };
}
