/**
 * Content Generation Service: validates the request, applies CRENIX instructions,
 * and calls whichever text provider the registry selects.
 */
import { AIError, assertServer, type TextGenerationResult } from "../ai/types";
import { getTextProvider } from "../ai/registry";

assertServer();

export const CONTENT_LIMITS = {
  maxPromptChars: 8000,
  maxOutputTokens: 2500,
};

export type ContentKind = "content" | "video-editing";

const INSTRUCTIONS: Record<ContentKind, string> = {
  content: [
    "You are the CRENIX content assistant for Thai businesses.",
    "Follow the user's brief exactly: content type, platform, tone, length and call to action.",
    "Write in the language the brief asks for; if none is given, write in Thai.",
    "Use only facts given in the brief. Never invent prices, statistics, reviews, certifications or health claims; use a clearly marked placeholder like [ราคา] instead.",
    "Return only the finished content, ready to paste, without preamble.",
  ].join(" "),
  "video-editing": [
    "You are the CRENIX video editing assistant.",
    "Give a practical, step-by-step editing plan for the user's footage and software, as numbered steps with timestamps and concrete settings.",
    "Write in Thai unless the brief asks for another language. Keep software menu names in English as they appear in the app.",
    "If a setting depends on the software version, say so briefly.",
  ].join(" "),
};

export async function generateContent(kind: ContentKind, prompt: string): Promise<TextGenerationResult> {
  const text = prompt.trim();
  if (!text) throw new AIError("กรุณาใส่ Prompt ก่อนสร้าง", 400, "invalid_input");
  if (text.length > CONTENT_LIMITS.maxPromptChars) {
    throw new AIError(`Prompt ยาวเกิน ${CONTENT_LIMITS.maxPromptChars.toLocaleString()} ตัวอักษร`, 400, "invalid_input");
  }
  const provider = getTextProvider();
  if (!provider.isConfigured()) {
    throw new AIError(`ยังไม่ได้ตั้งค่า API key ของ ${provider.name} — ใส่ OPENAI_API_KEY ในไฟล์ .env.local แล้วรีสตาร์ท dev server`, 503, "not_configured");
  }
  return provider.generateText({
    instructions: INSTRUCTIONS[kind],
    prompt: text,
    maxOutputTokens: CONTENT_LIMITS.maxOutputTokens,
  });
}
