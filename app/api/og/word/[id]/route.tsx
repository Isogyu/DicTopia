import { ImageResponse } from "@vercel/og";
import { z } from "zod";
import { loadJapaneseFonts, OG_BRAND, OG_CACHE_CONTROL } from "@/lib/og";

export const runtime = "edge";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * 造語ごとの OGP 画像。
 *
 * Service Role キーではなく anon キー + RLS で読み取る。
 * 未公開の造語は RLS の時点で返らないため、
 * 「非公開になった造語の OGP が漏れる」経路をなくせる。
 */
async function fetchWord(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/words?id=eq.${id}&is_published=eq.true&select=word,definition,category,votes_count&limit=1`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // OGP クローラーからの連打に備えて CDN 側でキャッシュ
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return null;
  const rows = (await res.json()) as {
    word: string;
    definition: string;
    category: string;
    votes_count: number;
  }[];

  return rows[0] ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return renderFallback();
  }

  const word = await fetchWord(params.id).catch(() => null);
  if (!word) {
    return renderFallback();
  }

  const fonts = await loadJapaneseFonts();

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: OG_BRAND.bg,
          padding: 72,
          position: "relative",
        }}
      >
        {/* 左端のブランドバー */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 20,
            backgroundColor: OG_BRAND.accent,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: OG_BRAND.accent,
              backgroundColor: OG_BRAND.accentSoft,
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            {word.category}
          </div>
          <div style={{ fontSize: 26, color: OG_BRAND.muted }}>
            ▲ {word.votes_count}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: word.word.length > 10 ? 76 : 104,
            fontWeight: 700,
            color: OG_BRAND.ink,
            marginTop: 32,
            lineHeight: 1.2,
          }}
        >
          {truncate(word.word, 18)}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: OG_BRAND.sub,
            lineHeight: 1.5,
            marginTop: 24,
          }}
        >
          {truncate(word.definition, 90)}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: OG_BRAND.ink }}>
            DicTopia
          </div>
          <div style={{ fontSize: 26, color: OG_BRAND.muted }}>
            あなたの造語が、未来の辞書になる。
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  response.headers.set("Cache-Control", OG_CACHE_CONTROL);
  return response;
}

async function renderFallback() {
  const fonts = await loadJapaneseFonts();

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: OG_BRAND.bg,
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, color: OG_BRAND.ink }}>
          DicTopia
        </div>
        <div style={{ fontSize: 32, color: OG_BRAND.sub, marginTop: 24 }}>
          あなたの造語が、未来の辞書になる。
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  response.headers.set("Cache-Control", OG_CACHE_CONTROL);
  return response;
}
