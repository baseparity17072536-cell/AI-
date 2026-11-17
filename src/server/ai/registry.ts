/**
 * Provider registry + adapter selection.
 * UI and services ask for "a text provider" / "an image provider" — never for OpenAI or Runway
 * directly — so providers can be swapped with an environment variable.
 */
import { assertServer, type AIProvider, type Capability, type ProviderStatus, type TextProvider } from "./types";
import { openaiText } from "./providers/openai";
import { PLANNED_PROVIDERS } from "./providers/planned";

assertServer();

/** Implemented adapters by capability family */
const TEXT_PROVIDERS: Record<string, TextProvider> = {
  openai: openaiText,
};

/** Every known provider (implemented first, then planned), de-duplicated by id */
export const ALL_PROVIDERS: AIProvider[] = [openaiText, ...PLANNED_PROVIDERS.filter((p) => p.id !== openaiText.id)];

export function providerStatus(p: AIProvider): ProviderStatus {
  if (!p.implemented) return "not-implemented";
  return p.isConfigured() ? "configured" : "needs-key";
}

/** Text provider chosen by AI_TEXT_PROVIDER (default: openai). Falls back to an implemented one. */
export function getTextProvider(): TextProvider {
  const id = process.env.AI_TEXT_PROVIDER?.trim() || "openai";
  return TEXT_PROVIDERS[id] ?? openaiText;
}

/** Providers that list a capability (implemented or not), for admin/health views. */
export function providersFor(capability: Capability) {
  return ALL_PROVIDERS.filter((p) => p.capabilities.includes(capability));
}
