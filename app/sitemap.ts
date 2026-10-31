import type { MetadataRoute } from "next";
import { routes, isIndexable } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** 색인 허용 페이지(정규 URL)만 포함. 미리보기 빌드에서는 빈 사이트맵. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(process.env.SITE_LASTMOD || Date.now());
  return routes.filter(isIndexable).map((r) => ({
    url: absoluteUrl(r.path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));
}
