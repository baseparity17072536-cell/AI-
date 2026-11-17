/**
 * OpenAI provider (text) — Responses API via fetch, no SDK dependency.
 * Docs: https://developers.openai.com/api/reference/resources/responses/methods/create
 * The API key is read from the server environment only (OPENAI_API_KEY).
 */
import { AIError, assertServer, hasEnv, type TextGenerationInput, type TextGenerationResult, type TextProvider } from "../types";

assertServer();

const API_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 60_000;

/** Default text model; override with OPENAI_TEXT_MODEL. Checked against OpenAI's models page on 2026-11-17. */
export const OPENAI_DEFAULT_TEXT_MODEL = "gpt-6.1-terra";

type OutputItem = {
  type?: string;
  content?: { type?: string; text?: string; refusal?: string }[];
};
type ResponsesBody = {
  id?: string;
  status?: string;
  output?: OutputItem[];
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string; code?: string } | null;
};

export const openaiText: TextProvider = {
  id: "openai",
  name: "OpenAI",
  capabilities: ["text"],
  env: ["OPENAI_API_KEY"],
  docs: [
    { label: "OpenAI Models", url: "https://developers.openai.com/api/docs/models" },
    { label: "Responses API", url: "https://developers.openai.com/api/reference/resources/responses/methods/create" },
  ],
  implemented: true,

  isConfigured: () => hasEnv(["OPENAI_API_KEY"]),

  async generateText(input: TextGenerationInput): Promise<TextGenerationResult> {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) throw new AIError("ยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env.local", 503, "not_configured");
    const model = input.model || process.env.OPENAI_TEXT_MODEL?.trim() || OPENAI_DEFAULT_TEXT_MODEL;

    let res: Response;
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          instructions: input.instructions,
          input: input.prompt,
          max_output_tokens: input.maxOutputTokens,
          // Don't keep customer content on OpenAI's side for later retrieval
          store: false,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
        throw new AIError("AI ใช้เวลานานเกินไป กรุณาลองใหม่", 504, "timeout");
      }
      throw new AIError("เชื่อมต่อ OpenAI ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", 502, "provider_error");
    }

    const body = (await res.json().catch(() => ({}))) as ResponsesBody;

    if (!res.ok) {
      // Map provider errors to safe messages; log details server-side only (never the key)
      console.error(`[openai] ${res.status} ${body.error?.code ?? ""} ${body.error?.message ?? ""}`.trim());
      if (res.status === 401) throw new AIError("API key ของ OpenAI ไม่ถูกต้องหรือถูกยกเลิกแล้ว", 502, "not_configured");
      if (res.status === 429) throw new AIError("OpenAI ปฏิเสธคำขอชั่วคราว (เกินโควตาหรือยอดเงินไม่พอ) กรุณาลองใหม่ภายหลัง", 503, "rate_limited");
      if (res.status === 404) throw new AIError(`ไม่พบโมเดล "${model}" ในบัญชี OpenAI นี้`, 502, "provider_error");
      throw new AIError("OpenAI ตอบกลับผิดพลาด กรุณาลองใหม่", 502, "provider_error");
    }

    const parts = (body.output ?? []).filter((o) => o.type === "message").flatMap((o) => o.content ?? []);
    const refusal = parts.find((c) => c.type === "refusal")?.refusal;
    const text = parts
      .filter((c) => c.type === "output_text" && typeof c.text === "string")
      .map((c) => c.text)
      .join("")
      .trim();

    if (!text && refusal) throw new AIError("AI ปฏิเสธคำขอนี้ ลองปรับรายละเอียดแล้วสร้างใหม่", 422, "refused");
    if (!text) throw new AIError("AI ไม่ได้ส่งข้อความกลับมา กรุณาลองใหม่", 502, "provider_error");

    return {
      text,
      provider: "openai",
      model,
      finish: body.status === "incomplete" ? "incomplete" : "completed",
      generationId: body.id,
      usage: body.usage
        ? { inputTokens: body.usage.input_tokens ?? 0, outputTokens: body.usage.output_tokens ?? 0 }
        : undefined,
    };
  },
};
