/**
 * Model Registry — what each model can do and what it costs, with sources.
 *
 * Rules:
 *  - Only facts read in official provider docs/pricing pages. Anything ambiguous is
 *    "not-verified"; anything not found is left undefined / "unknown".
 *  - Prices are metadata for estimates; the bill comes from the provider.
 *  - Re-check `checkedAt` sources before changing values. Providers change models often.
 */
import type { Capability, Pricing, Source, Verification } from "./types";

export type ModelInfo = {
  /** Registry key: "<provider>:<modelId>" */
  key: string;
  provider: string;
  /** Exact model id sent to the provider API */
  modelId: string;
  name: string;
  capabilities: Capability[];
  /** Video/audio length limits per single generation */
  durationSeconds?: { min?: number; max?: number; status: Verification; note?: string };
  aspectRatios?: { values: string[]; status: Verification };
  resolutions?: { values: string[]; status: Verification };
  /** ISO language codes for speech models */
  languages?: { values: string[]; status: Verification; note?: string };
  audioOutput?: { value: boolean; status: Verification };
  pricing: Pricing[];
  sources: Source[];
  checkedAt: string;
};

const CHECKED = "2026-11-17";

const SRC = {
  openaiModels: { label: "OpenAI Models", url: "https://developers.openai.com/api/docs/models" },
  geminiPricing: { label: "Gemini API pricing", url: "https://ai.google.dev/gemini-api/docs/pricing" },
  runwayModels: { label: "Runway API: Available models", url: "https://docs.dev.runwayml.com/guides/models/" },
  runwayPricing: { label: "Runway API pricing", url: "https://dev.runwayml.com/pricing" },
  runwayGen45Help: { label: "Runway Help: Gen-4.5", url: "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5" },
  elevenPricing: { label: "ElevenLabs API pricing", url: "https://elevenlabs.io/pricing/api" },
  elevenModels: { label: "ElevenLabs Models", url: "https://elevenlabs.io/docs/overview/models" },
} satisfies Record<string, Source>;

export const MODELS: ModelInfo[] = [
  /* ---------- Text ---------- */
  {
    key: "openai:gpt-6.1-terra",
    provider: "openai",
    modelId: "gpt-6.1-terra",
    name: "GPT-6.1 Terra",
    capabilities: ["text"],
    pricing: [{ status: "verified", unit: "per 1M input tokens", usd: 1, note: "output $5 per 1M tokens" }],
    sources: [SRC.openaiModels],
    checkedAt: CHECKED,
  },
  {
    key: "openai:gpt-6-luna",
    provider: "openai",
    modelId: "gpt-6-luna",
    name: "GPT-6 Luna",
    capabilities: ["text"],
    pricing: [{ status: "verified", unit: "per 1M input tokens", usd: 0.1, note: "output $0.50 per 1M tokens" }],
    sources: [SRC.openaiModels],
    checkedAt: CHECKED,
  },
  {
    key: "gemini:gemini-3.8-flash",
    provider: "gemini",
    modelId: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    capabilities: ["text"],
    pricing: [
      {
        status: "verified",
        unit: "per 1M input tokens",
        usd: 0.75,
        note: "intro price until 2026-12-31 (output $3.75); from 2027-01-01 $1.50 in / $7.50 out",
      },
    ],
    sources: [SRC.geminiPricing],
    checkedAt: CHECKED,
  },
  {
    key: "gemini:gemini-3.5-flash-lite",
    provider: "gemini",
    modelId: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    capabilities: ["text"],
    pricing: [{ status: "verified", unit: "per 1M input tokens", usd: 0.3, note: "output $2.50 per 1M tokens" }],
    sources: [SRC.geminiPricing],
    checkedAt: CHECKED,
  },

  /* ---------- Image ---------- */
  {
    key: "runway:gen4_image",
    provider: "runway",
    modelId: "gen4_image",
    name: "Runway Gen-4 Image",
    capabilities: ["text-to-image"],
    resolutions: { values: ["720p", "1080p"], status: "verified" },
    pricing: [
      { status: "verified", unit: "per image (720p)", usd: 0.05, note: "5 credits; 1 credit = $0.01" },
      { status: "verified", unit: "per image (1080p)", usd: 0.08, note: "8 credits" },
    ],
    sources: [SRC.runwayModels, SRC.runwayPricing],
    checkedAt: CHECKED,
  },
  {
    key: "runway:gen4_image_turbo",
    provider: "runway",
    modelId: "gen4_image_turbo",
    name: "Runway Gen-4 Image Turbo",
    capabilities: ["text-to-image"],
    pricing: [{ status: "unknown", note: "Runway lists it as its most cost-efficient image model; price not confirmed" }],
    sources: [SRC.runwayModels],
    checkedAt: CHECKED,
  },
  /* ---------- Video ---------- */
  {
    key: "runway:gen4.5",
    provider: "runway",
    modelId: "gen4.5",
    name: "Runway Gen-4.5",
    capabilities: ["text-to-video", "image-to-video"],
    durationSeconds: { min: 2, max: 10, status: "not-verified", note: "2–10 s per Runway Help (app); API limits not confirmed" },
    pricing: [{ status: "verified", unit: "per second of video", usd: 0.12, note: "12 credits/s, minimum 2 s per generation" }],
    sources: [SRC.runwayModels, SRC.runwayPricing, SRC.runwayGen45Help],
    checkedAt: CHECKED,
  },
  {
    key: "runway:gen4_turbo",
    provider: "runway",
    modelId: "gen4_turbo",
    name: "Runway Gen-4 Turbo",
    capabilities: ["image-to-video"],
    aspectRatios: { values: ["1280:720", "1584:672", "1104:832", "720:1280", "832:1104", "960:960"], status: "verified" },
    pricing: [{ status: "verified", unit: "per second of video", usd: 0.05, note: "5 credits/s, 10-credit minimum" }],
    sources: [SRC.runwayModels, SRC.runwayPricing],
    checkedAt: CHECKED,
  },

  /* ---------- Audio ---------- */
  {
    key: "elevenlabs:eleven_v3",
    provider: "elevenlabs",
    modelId: "eleven_v3",
    name: "Eleven v3",
    capabilities: ["text-to-speech"],
    languages: {
      values: ["th", "en"],
      status: "verified",
      note: "Thai is listed for v3 in ElevenLabs model docs (70+ languages); only th/en tracked here",
    },
    pricing: [{ status: "verified", unit: "per 1K characters", usd: 0.08 }],
    sources: [SRC.elevenModels, SRC.elevenPricing],
    checkedAt: CHECKED,
  },
  {
    key: "elevenlabs:eleven_multilingual_v2",
    provider: "elevenlabs",
    modelId: "eleven_multilingual_v2",
    name: "Eleven Multilingual v2",
    capabilities: ["text-to-speech"],
    languages: { values: [], status: "verified", note: "Thai is NOT in this model's language list — do not use for Thai" },
    pricing: [{ status: "unknown" }],
    sources: [SRC.elevenModels],
    checkedAt: CHECKED,
  },
];

export function getModel(key: string) {
  return MODELS.find((m) => m.key === key);
}

export function modelsFor(capability: Capability, provider?: string) {
  return MODELS.filter((m) => m.capabilities.includes(capability) && (!provider || m.provider === provider));
}
