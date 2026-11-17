import type { MetadataRoute } from "next";
import { categories } from "@/data/prompts";
import { libraryPrompts } from "@/data/library";
import { TUTORIALS } from "@/data/tutorials";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, priority });
  return [
    page("/", 1),
    page("/prompts", 0.9),
    page("/builder", 0.8),
    page("/planner", 0.7),
    page("/tutorials", 0.7),
    page("/pricing", 0.6),
    ...categories.map((c) => page(`/prompts/${c.slug}`, 0.8)),
    ...libraryPrompts.map((p) => ({ ...page(`/prompts/${p.category}/${p.id}`, 0.7), lastModified: p.createdAt })),
    ...TUTORIALS.map((t) => ({ ...page(`/tutorials/${t.slug}`, 0.6), lastModified: t.checkedAt })),
  ];
}
