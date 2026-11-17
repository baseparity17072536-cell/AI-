/**
 * Simple in-memory rate limiter (per server instance).
 * Good enough for local testing; replace with a shared store (database/Redis)
 * plus per-user credits once accounts exist — serverless instances don't share memory.
 */
import { assertServer } from "./ai/types";

assertServer();

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // bound memory
  return { ok: true, retryAfterSec: 0 };
}
