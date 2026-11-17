import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Personal pages hold no public content
    rules: { userAgent: "*", allow: "/", disallow: ["/my-prompts", "/account"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
