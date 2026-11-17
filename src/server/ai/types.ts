/**
 * AI Provider Layer — provider-neutral contracts.
 *
 * Services and UI depend only on these types. Each provider lives in its own file
 * under providers/ and implements the interfaces for the capabilities it supports,
 * so a provider can be swapped or added without touching the rest of the app.
 */

/* ---------------- shared ---------------- */

export type Capability =
  | "text"
  | "text-to-image"
  | "image-to-image"
  | "image-edit"
  | "text-to-video"
  | "image-to-video"
  | "video-to-video"
  | "text-to-speech"
  | "sound-effects"
  | "music"
  | "video-processing"
  | "storage";

/** How sure we are about a fact: read in official docs, ambiguous, or not found. */
export type Verification = "verified" | "not-verified" | "unknown";

export type Source = { label: string; url: string };

/** Pricing metadata — informational only; real cost comes from the provider response/billing. */
export type Pricing = {
  status: Verification;
  /** e.g. "per 1M input tokens", "per image (1080p)", "per second of video", "per 1K characters" */
  unit?: string;
  usd?: number;
  /** Extra detail (output price, minimums, promo end dates) */
  note?: string;
};

/** Is the adapter written, and is it configured on this server? */
export type ProviderStatus =
  /** Adapter implemented and env vars set (a live check confirms the key actually works) */
  | "configured"
  /** Adapter implemented, env vars missing */
  | "needs-key"
  /** Adapter not written yet — cannot generate even with a key */
  | "not-implemented";

export interface AIProvider {
  id: string;
  name: string;
  capabilities: Capability[];
  /** Environment variable names this provider needs (names only, never values) */
  env: string[];
  docs: Source[];
  /** True once the adapter code exists and has been tested */
  implemented: boolean;
  isConfigured(): boolean;
}

/* ---------------- text ---------------- */

export type TextGenerationInput = {
  instructions: string;
  prompt: string;
  maxOutputTokens: number;
  model?: string;
};

export type TextGenerationResult = {
  text: string;
  provider: string;
  model: string;
  finish: "completed" | "incomplete";
  usage?: { inputTokens: number; outputTokens: number };
  /** Provider's own id for the request, when it returns one */
  generationId?: string;
};

export interface TextProvider extends AIProvider {
  generateText(input: TextGenerationInput): Promise<TextGenerationResult>;
}

/* ---------------- media jobs (image / video / audio) ---------------- */

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

/** Long-running generations are jobs: submit, then poll or receive a webhook. */
export type JobRef = { provider: string; model: string; generationId: string; status: JobStatus };

export type JobResult = JobRef & {
  /** Provider-hosted output URLs (usually temporary — must be copied to our storage) */
  outputUrls: string[];
  error?: string;
  /** Actual cost if the provider reports it */
  costUsd?: number;
};

export type ImageGenerationInput = {
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  count?: number;
  /** For image-to-image / editing: URL of an image already in our storage */
  referenceImageUrl?: string;
};

export type VideoGenerationInput = {
  model: string;
  prompt: string;
  durationSeconds: number;
  aspectRatio?: string;
  resolution?: string;
  /** Image-to-video: URL of the first frame in our storage */
  imageUrl?: string;
  /** Video-to-video, when the model supports it */
  videoUrl?: string;
  audio?: boolean;
};

export type AudioGenerationInput = {
  model: string;
  text: string;
  /** ISO language code, e.g. "th", "en" */
  language?: string;
  voiceId?: string;
  format?: "mp3" | "wav";
};

export interface ImageProvider extends AIProvider {
  submitImage(input: ImageGenerationInput): Promise<JobRef>;
  getJob(generationId: string): Promise<JobResult>;
}

export interface VideoProvider extends AIProvider {
  submitVideo(input: VideoGenerationInput): Promise<JobRef>;
  getJob(generationId: string): Promise<JobResult>;
  cancelJob?(generationId: string): Promise<void>;
}

export interface AudioProvider extends AIProvider {
  submitAudio(input: AudioGenerationInput): Promise<JobRef>;
  getJob(generationId: string): Promise<JobResult>;
}

/* ---------------- processing & storage ---------------- */

export type RenderClip = { url: string; startSeconds?: number; endSeconds?: number };
export type RenderInput = {
  clips: RenderClip[];
  audioTracks?: { url: string; volume?: number }[];
  subtitlesSrt?: string;
  aspectRatio: string;
  resolution: string;
};

export interface VideoProcessingProvider extends AIProvider {
  submitRender(input: RenderInput): Promise<JobRef>;
  getJob(jobId: string): Promise<JobResult>;
}

export interface StorageProvider extends AIProvider {
  /** Store bytes under a user-scoped key; returns the storage key (not a public URL). */
  put(key: string, body: ArrayBuffer, contentType: string): Promise<string>;
  /** Short-lived signed URL for an object the caller is authorized to read */
  signedUrl(key: string, expiresInSeconds: number): Promise<string>;
  remove(key: string): Promise<void>;
}

/* ---------------- errors ---------------- */

export type AIErrorCode =
  | "not_configured"
  | "not_implemented"
  | "disabled"
  | "invalid_input"
  | "unsupported"
  | "rate_limited"
  | "provider_error"
  | "refused"
  | "timeout";

/** Error safe to show to users (no secrets, no raw provider payloads). */
export class AIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: AIErrorCode,
  ) {
    super(message);
  }
}

/** Server code must never be bundled into the browser (keys live here). */
export function assertServer() {
  if (typeof window !== "undefined") throw new Error("AI provider code must only run on the server");
}

/** True when every listed env var has a non-empty value. Reads names only. */
export function hasEnv(names: string[]) {
  return names.every((n) => Boolean(process.env[n]?.trim()));
}
