/**
 * Provider health & connection status.
 *
 * - Static check (default): is the adapter implemented, are its env vars present? Free.
 * - Live check (optional): calls a FREE, non-generating endpoint to confirm the key works.
 *   Only OpenAI has a live check (GET /v1/models lists models; it does not generate content).
 *   Other providers report "not-implemented" until their adapter exists — never a fake "ok".
 */
import { assertServer, type AIProvider, type Capability, type ProviderStatus } from "./types";
import { ALL_PROVIDERS, providerStatus } from "./registry";
import { MODELS } from "./models";

assertServer();

export type LiveCheck = { ok: boolean; ms: number; detail: string };

export type ProviderHealth = {
  id: string;
  name: string;
  capabilities: Capability[];
  status: ProviderStatus;
  /** Env var NAMES and whether each is set — never values */
  env: { name: string; set: boolean }[];
  models: number;
  live?: LiveCheck;
};

async function liveCheck(p: AIProvider): Promise<LiveCheck | undefined> {
  if (p.id !== "openai" || !p.isConfigured()) return undefined;
  const started = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim()}` },
      signal: AbortSignal.timeout(10_000),
    });
    const ms = Date.now() - started;
    if (res.ok) return { ok: true, ms, detail: "API key accepted" };
    if (res.status === 401) return { ok: false, ms, detail: "API key rejected (401)" };
    return { ok: false, ms, detail: `HTTP ${res.status}` };
  } catch {
    return { ok: false, ms: Date.now() - started, detail: "network error or timeout" };
  }
}

export async function getProviderHealth(opts: { live?: boolean } = {}): Promise<ProviderHealth[]> {
  return Promise.all(
    ALL_PROVIDERS.map(async (p) => ({
      id: p.id,
      name: p.name,
      capabilities: p.capabilities,
      status: providerStatus(p),
      env: p.env.map((name) => ({ name, set: Boolean(process.env[name]?.trim()) })),
      models: MODELS.filter((m) => m.provider === p.id).length,
      live: opts.live ? await liveCheck(p) : undefined,
    })),
  );
}
