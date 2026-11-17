import { categories, type CategorySlug } from "@/data/prompts";

export type Tier = "free" | "premium";
export type Badge = "popular" | "new";
export type SortKey = "recommended" | "popular" | "newest" | "az";

/** One prompt in public/data/prompts.json */
export type LibraryPrompt = {
  id: string;
  title: string;
  /** Short Thai description shown on cards */
  description: string;
  category: CategorySlug;
  tier: Tier;
  badges: Badge[];
  recommended: boolean;
  /** The AI tool we recommend most for this prompt (also listed in `tools`) */
  recommendedTool: string;
  tools: string[];
  keywords: string[];
  /** Internal ranking score used for the "Popular" sort — not a usage count */
  popularity: number;
  createdAt: string;
  preview: { from: string; to: string; image?: string };
  /** Prompt to copy (English) */
  promptEn: string;
  /** Thai translation */
  promptTh: string;
};

/** Shape of public/data/prompts.json */
export type LibraryData = {
  howTo: Record<CategorySlug, string[]>;
  prompts: LibraryPrompt[];
};

export const LIBRARY_DATA_URL = "/data/prompts.json";

export const PAGE_SIZE = 9;

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  popular: "Popular",
  newest: "Newest",
  az: "A–Z",
};

/** English filter labels from the brief, reusing icons from the shared category data. */
export const CATEGORY_FILTERS = [
  { slug: "video-editing", label: "Video Editing" },
  { slug: "image", label: "Image Creation" },
  { slug: "content", label: "Content Creation" },
  { slug: "video", label: "Video Creation" },
].map((f) => ({ ...f, icon: categories.find((c) => c.slug === f.slug)!.icon })) as {
  slug: CategorySlug;
  label: string;
  icon: (typeof categories)[number]["icon"];
}[];

export function categoryLabel(slug: CategorySlug) {
  return CATEGORY_FILTERS.find((c) => c.slug === slug)?.label ?? slug;
}

export function detailHref(item: Pick<LibraryPrompt, "id" | "category">) {
  return `/prompts/${item.category}/${item.id}`;
}

export function builderHref(item: Pick<LibraryPrompt, "id">) {
  return `/builder?prompt=${encodeURIComponent(item.id)}`;
}

export function sortPrompts(list: LibraryPrompt[], sort: SortKey) {
  const out = [...list];
  switch (sort) {
    case "recommended":
      return out.sort((a, b) => Number(b.recommended) - Number(a.recommended) || b.popularity - a.popularity);
    case "popular":
      return out.sort((a, b) => b.popularity - a.popularity);
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "az":
      return out.sort((a, b) => a.title.localeCompare(b.title, "en"));
  }
}

export function matchesQuery(item: LibraryPrompt, q: string) {
  if (!q) return true;
  const haystack = [
    item.title,
    item.description,
    categoryLabel(item.category),
    ...item.keywords,
    ...item.tools,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
