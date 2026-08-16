import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "edge";

interface FontData {
  data: ArrayBuffer;
  name: string;
  style: "normal" | "italic";
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

async function loadJapaneseFonts(): Promise<FontData[]> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
    ).then((res) => res.text());

    const faceRegex = /@font-face\s*{([^}]+)}/g;
    const fonts: FontData[] = [];
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
        weight: weight as FontData["weight"],
      });
    }

    return fonts;
  } catch {
    return [];
  }
}

function truncateDefinition(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return renderFallback();
  }

  const supabase = createAdminClient();
  const { data: word } = await supabase
    .from("words")
    .select("word, definition, votes_count, is_published")
    .eq("id", params.id)
    .maybeSingle();

  if (!word || !word.is_published) {
    return renderFallback();
  }

  const fonts = await loadJapaneseFonts();

  const title = word.word;
  const definition = truncateDefinition(word.definition);
  const votes = `票数: ${word.votes_count}`;

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1000,
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 36, color: "#cbd5e1", lineHeight: 1.4 }}>
            {definition}
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 24 }}>
            {votes}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#64748b",
              marginTop: "auto",
              alignSelf: "flex-end",
            }}
          >
            DicTopia
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  response.headers.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=3600"
  );

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
          backgroundColor: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>DicTopia</div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 24 }}>
          造語が生まれる場所
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  response.headers.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=3600"
  );

  return response;
}
