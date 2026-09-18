import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateVoterHash } from "@/lib/hash";
import { clientKey, rateLimit, retryAfterHeaders } from "@/lib/rate-limit";
import type { ReactResponse } from "@/types/api";

const reactSchema = z.object({
  emoji_type: z.enum(["fire", "laugh", "cry", "clap"], {
    message: "絵文字タイプは fire / laugh / cry / clap のいずれかを指定してください",
  }),
});

/** リアクションは軽い操作なので上限は緩め。連打スクリプトだけを止める。 */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

/** PostgreSQL: 列が存在しない */
const UNDEFINED_COLUMN = "42703";
/** PostgreSQL: 一意制約違反 */
const UNIQUE_VIOLATION = "23505";
/** PostgreSQL: 外部キー違反 */
const FOREIGN_KEY_VIOLATION = "23503";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json(
      { success: false, error: "造語が見つかりません" } as ReactResponse,
      { status: 404 }
    );
  }

  const wordId = params.id;

  const limit = rateLimit(
    clientKey(request, "reactions:create"),
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "操作が速すぎます。少し時間をおいてお試しください",
      } as ReactResponse,
      { status: 429, headers: retryAfterHeaders(limit) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "リクエストボディを解析できません" } as ReactResponse,
      { status: 400 }
    );
  }

  const parse = reactSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      {
        success: false,
        error: parse.error.issues[0]?.message ?? "不正な入力です",
      } as ReactResponse,
      { status: 400 }
    );
  }

  const { emoji_type } = parse.data;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  // 投票と同じ「IP + UA + 日付」から識別子を作り、同日同絵文字の重複を防ぐ
  const reactorHash = generateVoterHash(ip, userAgent);

  const supabase = createAdminClient();

  // 非公開になった造語にはリアクションを付けさせない
  const { data: word } = await supabase
    .from("words")
    .select("id")
    .eq("id", wordId)
    .eq("is_published", true)
    .maybeSingle();

  if (!word) {
    return NextResponse.json(
      { success: false, error: "造語が見つかりません" } as ReactResponse,
      { status: 404 }
    );
  }

  let { error: insertError } = await supabase
    .from("reactions")
    .insert({ word_id: wordId, emoji_type, reactor_hash: reactorHash });

  // reactor_hash を追加するマイグレーション（0004）が未適用の環境でも動くよう、
  // 列が無い場合は従来どおり重複防止なしで登録する。
  if (insertError?.code === UNDEFINED_COLUMN) {
    ({ error: insertError } = await supabase
      .from("reactions")
      .insert({ word_id: wordId, emoji_type }));
  }

  if (insertError) {
    if (insertError.code === UNIQUE_VIOLATION) {
      return NextResponse.json(
        {
          success: false,
          error: "すでにこのリアクションを送信済みです",
        } as ReactResponse,
        { status: 409 }
      );
    }

    if (insertError.code === FOREIGN_KEY_VIOLATION) {
      return NextResponse.json(
        { success: false, error: "造語が見つかりません" } as ReactResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "リアクションの登録に失敗しました" } as ReactResponse,
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true } as ReactResponse, { status: 201 });
}
