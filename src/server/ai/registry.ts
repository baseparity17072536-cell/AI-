/**
 * AI provider registry: which provider handles each capability.
 * Add providers (Gemini, Runway, TTS…) here without touching services or UI.
 */
import { assertServer, type TextProvider } from "./types";
import { openaiText } from "./providers/openai";

assertServer();

const TEXT_PROVIDERS: Record<string, TextProvider> = {
  openai: openaiText,
};

/** Provider for text/content generation. Select with AI_TEXT_PROVIDER (default: openai). */
export function getTextProvider(): TextProvider {
  const id = process.env.AI_TEXT_PROVIDER?.trim() || "openai";
  return TEXT_PROVIDERS[id] ?? openaiText;
}
