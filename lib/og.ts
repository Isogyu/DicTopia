/**
 * OGP 画像生成で共有するフォントロードとブランドカラー。
 * `app/api/og/**` の Edge Runtime から利用する。
 */

export interface OgFontData {
  data: ArrayBuffer;
  name: string;
  style: "normal" | "italic";
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

/** OGP 画像のブランドパレット（サイト本体のライトテーマと揃える） */
export const OG_BRAND = {
  bg: "#ffffff",
  ink: "#0f172a",
  sub: "#475569",
  muted: "#94a3b8",
  accent: "#4f46e5",
  accentSoft: "#eef2ff",
} as const;

let cached: OgFontData[] | null = null;

export async function loadJapaneseFonts(): Promise<OgFontData[]> {
  if (cached) return cached;

  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
    ).then((res) => res.text());

    const faceRegex = /@font-face\s*{([^}]+)}/g;
    const fonts: OgFontData[] = [];
    let match: RegExpExecArray | null;

    while ((match = faceRegex.exec(css)) !== null) {
      const block = match[1];
      const weightMatch = block.match(/font-weight:\s*(\d+)/);
      const urlMatch = block.match(/url\(([^)]+)\)/);

      if (!weightMatch || !urlMatch) continue;

      const weight = parseInt(weightMatch[1], 10);
      const url = urlMatch[1].replace(/^["']|["']$/g, "");
      const data = await fetch(url).then((res) => res.arrayBuffer());

      fonts.push({
        data,
        name: "Noto Sans JP",
        style: "normal",
        weight: weight as OgFontData["weight"],
      });
    }

    cached = fonts;
    return fonts;
  } catch {
    // フォント取得に失敗しても画像自体は返す（豆腐になるが 404 よりまし）
    return [];
  }
}

export const OG_CACHE_CONTROL =
  "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800";
