import { NextRequest, NextResponse } from "next/server";
import { searchWords } from "@/lib/words";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length === 0) {
    return NextResponse.json({ error: "検索語を入力してください" }, { status: 400 });
  }

  const requested = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_LIMIT)
      : DEFAULT_LIMIT;

  try {
    // 検索語のサニタイズは searchWords 内で行う。
    // 以前はユーザー入力を or() のフィルタ式へ直接埋め込んでいたため、
    // カンマ 1 文字でクエリが壊れ、任意のフィルタも注入できる状態だった。
    const { words, empty } = await searchWords(q, { limit });

    if (empty) {
      return NextResponse.json({ words: [] });
    }

    return NextResponse.json(
      { words },
      {
        headers: {
          // サジェストは同一クエリの連打が多いので短時間だけ CDN キャッシュ
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "検索に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
