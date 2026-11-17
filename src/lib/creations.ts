"use client";

/**
 * AI creations made in CRENIX (only real, successful generations are stored).
 * Per-user local storage for now; shape matches a future `creations` table.
 */
import { arrayOf, createStore, isObject, newId } from "./local-store";
import { getCurrentUserId } from "./account";

export type CreationKind = "content" | "video-editing" | "image" | "video" | "audio";

export type Creation = {
  id: string;
  ownerId: string;
  kind: CreationKind;
  prompt: string;
  /** Text output (content). Media kinds will store a file URL instead. */
  output: string;
  provider: string;
  model: string;
  createdAt: string;
};

const KINDS: CreationKind[] = ["content", "video-editing", "image", "video", "audio"];
const LIMIT = 50;

function isCreation(x: unknown): x is Creation {
  return (
    isObject(x) &&
    typeof x.id === "string" &&
    KINDS.includes(x.kind as CreationKind) &&
    typeof x.output === "string" &&
    typeof x.createdAt === "string"
  );
}

export const creationsStore = createStore<Creation[]>("creations", [], arrayOf(isCreation));

export function addCreation(input: Omit<Creation, "id" | "ownerId" | "createdAt">) {
  const item: Creation = { ...input, id: newId("cr"), ownerId: getCurrentUserId(), createdAt: new Date().toISOString() };
  creationsStore.set((cur) => [item, ...cur].slice(0, LIMIT));
  return item;
}

export function deleteCreation(id: string) {
  creationsStore.set((cur) => cur.filter((c) => c.id !== id));
}

export const CREATION_LABEL: Record<CreationKind, string> = {
  content: "Content",
  "video-editing": "Editing Plan",
  image: "Image",
  video: "Video",
  audio: "Audio",
};
