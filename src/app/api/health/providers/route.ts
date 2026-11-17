/**
 * GET /api/health/providers[?live=1]
 * Provider connection status for the owner/admin. Shows env var NAMES and whether they
 * are set — never values. In production it requires `Authorization: Bearer <CRENIX_ADMIN_TOKEN>`
 * (until real admin accounts exist), so the configuration isn't public.
 */
import { connection } from "next/server";
import { getProviderHealth } from "@/server/ai/health";
import { rateLimit } from "@/server/rate-limit";

export async function GET(request: Request) {
  await connection();

  if (process.env.NODE_ENV === "production") {
    const token = process.env.CRENIX_ADMIN_TOKEN?.trim();
    const auth = request.headers.get("authorization");
    if (!token || auth !== `Bearer ${token}`) {
      return Response.json({ error: { message: "Unauthorized", code: "unauthorized" } }, { status: 401 });
    }
  }

  const live = new URL(request.url).searchParams.get("live") === "1";
  if (live) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!rateLimit(`health-live:${ip}`, 5, 60_000).ok) {
      return Response.json({ error: { message: "Too many live checks", code: "rate_limited" } }, { status: 429 });
    }
  }

  const providers = await getProviderHealth({ live });
  return Response.json(
    { checkedAt: new Date().toISOString(), providers },
    { headers: { "Cache-Control": "no-store" } },
  );
}
