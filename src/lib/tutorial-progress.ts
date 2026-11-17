"use client";

import { arrayOf, createStore } from "./local-store";

const isString = (x: unknown): x is string => typeof x === "string";

/** Slugs of tutorials the user marked as completed (per user). */
export const completedStore = createStore<string[]>("tutorials-completed", [], arrayOf(isString));

export function toggleCompleted(slug: string) {
  completedStore.set((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
}
