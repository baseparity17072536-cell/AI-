/**
 * Providers that are planned but NOT implemented yet.
 *
 * These are descriptors only — no API calls, no generate methods. They exist so the
 * registry, health check and admin views can show them honestly as "not-implemented",
 * even when an API key is present. When an adapter is written, move it to its own file
 * implementing ImageProvider / VideoProvider / AudioProvider / ... and set implemented: true.
 */
import { assertServer, hasEnv, type AIProvider } from "../types";

assertServer();

function planned(p: Omit<AIProvider, "implemented" | "isConfigured">): AIProvider {
  return { ...p, implemented: false, isConfigured: () => hasEnv(p.env) };
}

export const PLANNED_PROVIDERS: AIProvider[] = [
  planned({
    id: "gemini",
    name: "Google Gemini",
    capabilities: ["text", "text-to-image"],
    env: ["GEMINI_API_KEY"],
    docs: [
      { label: "Gemini API models", url: "https://ai.google.dev/gemini-api/docs/models" },
      { label: "Gemini API pricing", url: "https://ai.google.dev/gemini-api/docs/pricing" },
    ],
  }),
  planned({
    id: "runway",
    name: "Runway Dev API",
    capabilities: ["text-to-image", "text-to-video", "image-to-video", "text-to-speech"],
    env: ["RUNWAYML_API_SECRET"],
    docs: [
      { label: "Runway API: Available models", url: "https://docs.dev.runwayml.com/guides/models/" },
      { label: "Runway API: Pricing", url: "https://docs.dev.runwayml.com/guides/pricing/" },
      { label: "Runway API reference", url: "https://docs.dev.runwayml.com/api/" },
    ],
  }),
  planned({
    id: "fal",
    name: "fal.ai",
    capabilities: ["text-to-image", "image-to-image", "text-to-video", "image-to-video"],
    env: ["FAL_KEY"],
    docs: [
      { label: "fal: Asynchronous inference (queue)", url: "https://fal.ai/docs/documentation/model-apis/inference/queue" },
      { label: "fal: Webhooks", url: "https://docs.fal.ai/model-apis/model-endpoints/webhooks" },
    ],
  }),
  planned({
    id: "replicate",
    name: "Replicate",
    capabilities: ["text-to-image", "image-to-image", "text-to-video", "image-to-video"],
    env: ["REPLICATE_API_TOKEN"],
    docs: [
      { label: "Replicate: Create a prediction", url: "https://replicate.com/docs/topics/predictions/create-a-prediction" },
      { label: "Replicate: HTTP API", url: "https://replicate.com/docs/reference/http" },
    ],
  }),
  planned({
    id: "elevenlabs",
    name: "ElevenLabs",
    capabilities: ["text-to-speech", "sound-effects"],
    env: ["ELEVENLABS_API_KEY"],
    docs: [
      { label: "ElevenLabs: Models", url: "https://elevenlabs.io/docs/overview/models" },
      { label: "ElevenLabs: API pricing", url: "https://elevenlabs.io/pricing/api" },
    ],
  }),
  planned({
    id: "ffmpeg",
    name: "FFmpeg worker",
    capabilities: ["video-processing"],
    env: ["VIDEO_WORKER_URL", "VIDEO_WORKER_TOKEN"],
    docs: [{ label: "FFmpeg documentation", url: "https://ffmpeg.org/documentation.html" }],
  }),
  planned({
    id: "supabase-storage",
    name: "Supabase Storage",
    capabilities: ["storage"],
    env: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    docs: [{ label: "Supabase pricing (storage)", url: "https://supabase.com/pricing" }],
  }),
  planned({
    id: "r2",
    name: "Cloudflare R2",
    capabilities: ["storage"],
    env: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"],
    docs: [{ label: "Cloudflare R2 docs", url: "https://developers.cloudflare.com/r2/" }],
  }),
];
