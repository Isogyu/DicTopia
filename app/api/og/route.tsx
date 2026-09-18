import { ImageResponse } from "@vercel/og";
import { loadJapaneseFonts, OG_BRAND, OG_CACHE_CONTROL } from "@/lib/og";

export const runtime = "edge";

/**
 * サイト共通の OGP 画像。
 * トップ・一覧・殿堂入りなど、個別画像を持たないページはこれを参照する。
 * `?title=` で見出しだけ差し替えられる。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "あなたの造語が、未来の辞書になる。").slice(
    0,
    40
  );

  const fonts = await loadJapaneseFonts();

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: OG_BRAND.bg,
          padding: 80,
          position: "relative",
        }}
      >
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

        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            color: OG_BRAND.accent,
          }}
        >
          DicTopia
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: OG_BRAND.ink,
            lineHeight: 1.25,
            marginTop: 24,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: OG_BRAND.sub,
            marginTop: 32,
            lineHeight: 1.5,
          }}
        >
          まだ辞書にない言葉を、みんなで作って育てるコミュニティ辞典。
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  response.headers.set("Cache-Control", OG_CACHE_CONTROL);
  return response;
}
