/**
 * Provider-neutral types for the AI Provider Layer.
 * Services depend on these, never on a specific provider's API shape,
 * so a provider can be swapped by adding a new file under providers/.
 */

export type TextGenerationInput = {
  /** System-level instructions (role, rules, output language) */
  instructions: string;
  /** The user's prompt */
  prompt: string;
  maxOutputTokens: number;
  /** Provider model id; falls back to the provider's configured default */
  model?: string;
};

export type TextGenerationResult = {
  text: string;
  provider: string;
  model: string;
  /** "incomplete" when the provider stopped early (e.g. hit the token limit) */
  finish: "completed" | "incomplete";
  usage?: { inputTokens: number; outputTokens: number };
};

export interface TextProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  generateText(input: TextGenerationInput): Promise<TextGenerationResult>;
}

/** Error safe to show to users (no secrets, no raw provider payloads) */
export class AIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: "not_configured" | "disabled" | "invalid_input" | "rate_limited" | "provider_error" | "refused" | "timeout",
  ) {
    super(message);
  }
}

/** Server code must never be bundled into the browser (keys live here). */
export function assertServer() {
  if (typeof window !== "undefined") throw new Error("AI provider code must only run on the server");
}
