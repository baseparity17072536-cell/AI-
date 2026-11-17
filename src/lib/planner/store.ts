"use client";

import { arrayOf, createStore, isObject, newId } from "@/lib/local-store";
import { getCurrentUserId } from "@/lib/account";
import type { PlatformId } from "@/data/builder/platforms";
import type { Project, Scene } from "./engine";

const PLATFORM_IDS: PlatformId[] = ["runway", "pika", "firefly", "canva", "general"];
const str = (x: unknown, d = "") => (typeof x === "string" ? x : d);
const num = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) ? x : d);

function toScene(x: unknown): Scene | null {
  if (!isObject(x) || typeof x.id !== "string") return null;
  return {
    id: x.id,
    title: str(x.title),
    seconds: Math.max(1, Math.round(num(x.seconds, 10))),
    visualEn: str(x.visualEn),
    visualTh: str(x.visualTh),
    camera: str(x.camera),
    voice: str(x.voice),
    sfx: str(x.sfx),
  };
}

function toProject(x: unknown): Project | null {
  if (!isObject(x) || typeof x.id !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: x.id,
    ownerId: str(x.ownerId, getCurrentUserId()),
    title: str(x.title, "Untitled project"),
    totalSeconds: Math.max(1, Math.round(num(x.totalSeconds, 60))),
    topic: str(x.topic),
    videoType: str(x.videoType),
    audience: str(x.audience),
    tone: str(x.tone),
    story: str(x.story),
    style: str(x.style),
    aspect: str(x.aspect),
    platformId: PLATFORM_IDS.includes(x.platformId as PlatformId) ? (x.platformId as PlatformId) : "general",
    voiceLanguage: str(x.voiceLanguage),
    voiceCharacter: str(x.voiceCharacter),
    music: str(x.music),
    scenes: Array.isArray(x.scenes) ? (x.scenes.map(toScene).filter(Boolean) as Scene[]) : [],
    createdAt: str(x.createdAt, now),
    updatedAt: str(x.updatedAt, now),
  };
}

export function newProject(partial: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: newId("proj"),
    ownerId: getCurrentUserId(),
    title: "โปรเจกต์วิดีโอใหม่",
    totalSeconds: 60,
    topic: "",
    videoType: "",
    audience: "",
    tone: "",
    story: "",
    style: "",
    aspect: "16:9",
    platformId: "runway",
    voiceLanguage: "",
    voiceCharacter: "",
    music: "",
    scenes: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** The project currently open in the planner (autosaved, survives refresh) */
export const draftStore = createStore<Project | null>("planner-draft", null, toProject);

/** Projects the user explicitly saved */
export const projectsStore = createStore<Project[]>("planner-projects", [], (raw) =>
  arrayOf((x): x is Project => toProject(x) !== null)(raw).map((x) => toProject(x)!),
);

export function saveProject(p: Project) {
  const saved = { ...p, updatedAt: new Date().toISOString() };
  projectsStore.set((cur) => [saved, ...cur.filter((x) => x.id !== p.id)]);
  return saved;
}

export function deleteProject(id: string) {
  projectsStore.set((cur) => cur.filter((x) => x.id !== id));
}

export const sceneId = () => newId("sc");
