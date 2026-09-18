import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { CATEGORIES } from "@/lib/categories";
import { listWordSitemapEntries } from "@/lib/words";

// 新しい造語を 1 時間以内にインデックス対象へ載せる
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/words"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/hall-of-fame"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: absoluteUrl(`/words/${category.slug}`),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  let wordEntries: MetadataRoute.Sitemap = [];
  try {
    const words = await listWordSitemapEntries();
    wordEntries = words.map((word) => ({
      url: absoluteUrl(`/word/${word.id}`),
      lastModified: new Date(word.created_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // DB 到達不可でも sitemap 自体は 200 を返し、静的ページはクロールさせる
  }

  return [...staticEntries, ...categoryEntries, ...wordEntries];
}
