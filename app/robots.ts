import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 検索結果ページはクロールさせず、カテゴリ一覧へ集約する
        disallow: ["/api/", "/search"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
