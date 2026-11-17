/**
 * POST /api/generate/content — generate marketing content / editing plans with AI.
 *
 * There are no accounts or credits yet, so this endpoint protects the owner's API budget:
 *  - disabled in production unless CRENIX_ENABLE_AI=true (turn on only after auth + credits exist)
 *  - same-origin requests only
 *  - per-IP rate limit, input length limit, output token cap
 * The OpenAI key never leaves the server.
 */
import { AIError } from "@/server/ai/types";
import { generateContent, type ContentKind } from "@/server/services/content";
import { rateLimit } from "@/server/rate-limit";

const KINDS: ContentKind[] = ["content", "video-editing"];
const RATE = { limit: 10, windowMs: 10 * 60_000 };

function fail(message: string, status: number, code: string, headers?: HeadersInit) {
  return Response.json({ error: { message, code } }, { status, headers });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.CRENIX_ENABLE_AI !== "true") {
    return fail("การสร้างด้วย AI ยังไม่เปิดให้บริการ", 403, "disabled");
  }

  // Same-origin only: blocks other websites from spending the API budget through this endpoint
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return fail("คำขอไม่ได้มาจากเว็บไซต์ CRENIX", 403, "forbidden");
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`content:${ip}`, RATE.limit, RATE.windowMs);
  if (!rl.ok) {
    return fail(`สร้างบ่อยเกินไป กรุณารอ ${rl.retryAfterSec} วินาที`, 429, "rate_limited", { "Retry-After": String(rl.retryAfterSec) });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("รูปแบบคำขอไม่ถูกต้อง", 400, "invalid_input");
  }
  const { prompt, kind } = (body ?? {}) as { prompt?: unknown; kind?: unknown };
  if (typeof prompt !== "string" || !KINDS.includes(kind as ContentKind)) {
    return fail("รูปแบบคำขอไม่ถูกต้อง", 400, "invalid_input");
  }

  try {
    const result = await generateContent(kind as ContentKind, prompt);
    return Response.json({
      text: result.text,
      provider: result.provider,
      model: result.model,
      finish: result.finish,
      usage: result.usage,
    });
  } catch (e) {
    if (e instanceof AIError) return fail(e.message, e.status, e.code);
    console.error("[generate/content] unexpected error", e);
    return fail("เกิดข้อผิดพลาด กรุณาลองใหม่", 500, "server_error");
  }
}
