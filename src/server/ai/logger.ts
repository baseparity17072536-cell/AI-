/**
 * Request logging for AI calls. Logs metadata only — never API keys, headers,
 * or full customer prompts (only their length).
 */
import { assertServer } from "./types";

assertServer();

type LogEntry = {
  route: string;
  provider?: string;
  model?: string;
  status: "ok" | "error";
  code?: string;
  ms: number;
  promptChars?: number;
  inputTokens?: number;
  outputTokens?: number;
  generationId?: string;
};

/** Defensive scrub in case a value ever contains something key-like */
const SECRET_PATTERNS = [/sk-[A-Za-z0-9_-]{10,}/g, /key_[A-Fa-f0-9]{20,}/g, /Bearer\s+[A-Za-z0-9._~+/=-]+/gi, /r8_[A-Za-z0-9]{10,}/g];

export function scrub(value: string) {
  return SECRET_PATTERNS.reduce((s, re) => s.replace(re, "[redacted]"), value);
}

export function logAIRequest(entry: LogEntry) {
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  // Structured line for later shipping to a log service
  console.info(`[ai] ${scrub(line)}`);
}
