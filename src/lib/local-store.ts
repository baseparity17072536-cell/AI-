"use client";

/**
 * Tiny reactive localStorage store, scoped per user.
 *
 * Every key is `crenix:<userId>:<name>`, so when real accounts arrive each
 * member's data stays separate on a shared browser. All persistence for
 * favorites, saved prompts, recents and planner projects goes through here,
 * which makes it the single seam to swap for a backend later (see docs/backend-plan.md).
 */
import { useSyncExternalStore } from "react";
import { getCurrentUserId } from "./account";

type Store<T> = {
  /** React hook: current value, re-renders on change (also across tabs). */
  use: () => T;
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
};

export function storageKey(name: string, userId = getCurrentUserId()) {
  return `crenix:${userId}:${name}`;
}

export function createStore<T>(name: string, fallback: T, parse: (raw: unknown) => T): Store<T> {
  let cachedKey: string | undefined;
  let cachedRaw: string | null | undefined;
  let cached: T = fallback;
  /** Used when localStorage is unavailable (private mode etc.) */
  let memory: T | undefined;
  const listeners = new Set<() => void>();

  function get(): T {
    if (memory !== undefined) return memory;
    const key = storageKey(name);
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return cached;
    }
    if (key !== cachedKey || raw !== cachedRaw) {
      cachedKey = key;
      cachedRaw = raw;
      try {
        cached = raw === null ? fallback : parse(JSON.parse(raw));
      } catch {
        cached = fallback;
      }
    }
    return cached;
  }

  function set(next: T | ((prev: T) => T)) {
    const value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    const raw = JSON.stringify(value);
    try {
      localStorage.setItem(storageKey(name), raw);
      cachedKey = storageKey(name);
      cachedRaw = raw;
      cached = value;
    } catch {
      memory = value;
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(name)) cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    use: () => useSyncExternalStore(subscribe, get, () => fallback),
    get,
    set,
  };
}

/** Parse helper: keep only array items that pass `check`. */
export function arrayOf<T>(check: (x: unknown) => x is T) {
  return (raw: unknown): T[] => (Array.isArray(raw) ? raw.filter(check) : []);
}

export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
