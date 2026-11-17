"use client";

/**
 * My Prompts data (Steps 5–7): saved/created prompts and "recently used".
 * Stored per user via local-store; the record shapes match the planned
 * `user_saved_prompts` table (docs/backend-plan.md) so migration is a straight copy.
 */
import type { CategorySlug } from "@/data/prompts";
import { arrayOf, createStore, isObject, newId } from "./local-store";
import { getCurrentUserId } from "./account";

export type PromptSource =
  | { type: "library"; libraryId: string }
  | { type: "builder"; libraryId?: string; builder?: unknown }
  | { type: "planner"; projectId: string }
  | { type: "manual" };

export type SavedPrompt = {
  id: string;
  ownerId: string;
  title: string;
  category: CategorySlug;
  promptEn: string;
  promptTh: string;
  tags: string[];
  /** User-defined collection name ("จัดหมวดหมู่") */
  collection: string;
  source: PromptSource;
  createdAt: string;
  updatedAt: string;
};

const CATS: CategorySlug[] = ["video-editing", "image", "content", "video"];

function isSaved(x: unknown): x is SavedPrompt {
  return (
    isObject(x) &&
    typeof x.id === "string" &&
    typeof x.title === "string" &&
    typeof x.promptEn === "string" &&
    CATS.includes(x.category as CategorySlug)
  );
}

export const savedStore = createStore<SavedPrompt[]>("saved-prompts", [], (raw) =>
  arrayOf(isSaved)(raw).map((p) => ({
    ...p,
    promptTh: typeof p.promptTh === "string" ? p.promptTh : "",
    tags: Array.isArray(p.tags) ? p.tags.filter((t) => typeof t === "string") : [],
    collection: typeof p.collection === "string" ? p.collection : "",
    source: isObject(p.source) ? p.source : { type: "manual" },
  })),
);

export type NewPrompt = Pick<SavedPrompt, "title" | "category" | "promptEn" | "promptTh" | "source"> &
  Partial<Pick<SavedPrompt, "tags" | "collection">>;

export function savePrompt(input: NewPrompt): SavedPrompt {
  const now = new Date().toISOString();
  const item: SavedPrompt = {
    id: newId("p"),
    ownerId: getCurrentUserId(),
    tags: [],
    collection: "",
    ...input,
    title: input.title.trim() || "Untitled prompt",
    createdAt: now,
    updatedAt: now,
  };
  savedStore.set((cur) => [item, ...cur]);
  return item;
}

export function updatePrompt(id: string, patch: Partial<Omit<SavedPrompt, "id" | "ownerId" | "createdAt">>) {
  savedStore.set((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
}

export function duplicatePrompt(id: string) {
  const src = savedStore.get().find((p) => p.id === id);
  if (!src) return null;
  return savePrompt({ ...src, title: `${src.title} (สำเนา)` });
}

export function deletePrompt(id: string) {
  savedStore.set((cur) => cur.filter((p) => p.id !== id));
}

/* ---------------- Recently used ---------------- */

export type RecentEntry = { kind: "library" | "saved"; id: string; at: string; action: "view" | "copy" | "customize" };

function isRecent(x: unknown): x is RecentEntry {
  return isObject(x) && (x.kind === "library" || x.kind === "saved") && typeof x.id === "string" && typeof x.at === "string";
}

export const recentStore = createStore<RecentEntry[]>("recent", [], arrayOf(isRecent));
const RECENT_LIMIT = 30;

export function trackRecent(kind: RecentEntry["kind"], id: string, action: RecentEntry["action"]) {
  recentStore.set((cur) =>
    [{ kind, id, action, at: new Date().toISOString() }, ...cur.filter((r) => !(r.kind === kind && r.id === id))].slice(0, RECENT_LIMIT),
  );
}
