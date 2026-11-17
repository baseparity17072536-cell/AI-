/**
 * Real connection status of each studio, computed on the server at request time.
 * Only reports presence of configuration — never key values.
 */
import { connection } from "next/server";
import type { StudioToolId } from "@/data/studio-tools";
import { assertServer } from "./types";
import { getTextProvider } from "./registry";

assertServer();

export type ToolStatus =
  /** Integrated and configured: generation works */
  | "connected"
  /** Integrated, but the API key is missing on the server */
  | "needs-key"
  /** Integrated and configured, but switched off in production (no accounts/credits yet) */
  | "disabled"
  /** Not integrated yet */
  | "coming-soon";

export async function getToolStatuses(): Promise<Record<StudioToolId, ToolStatus>> {
  await connection(); // read env at request time, not at build time

  const aiEnabled = process.env.NODE_ENV !== "production" || process.env.CRENIX_ENABLE_AI === "true";
  const content: ToolStatus = !getTextProvider().isConfigured() ? "needs-key" : aiEnabled ? "connected" : "disabled";

  return {
    content,
    // These integrations are not built yet; an API key alone does not make them work
    image: "coming-soon",
    video: "coming-soon",
    audio: "coming-soon",
    editor: "coming-soon",
  };
}
