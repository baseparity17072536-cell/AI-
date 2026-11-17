/**
 * Server-side access to the Prompt Library data.
 * The same JSON file is fetched by the browser on /prompts, so there is a single source of truth.
 */
import raw from "../../public/data/prompts.json";
import type { LibraryData, LibraryPrompt } from "@/components/library/types";

const data = raw as LibraryData;

export const libraryPrompts: LibraryPrompt[] = data.prompts;
export const libraryHowTo = data.howTo;

export function getLibraryPrompt(id: string) {
  return libraryPrompts.find((p) => p.id === id);
}
