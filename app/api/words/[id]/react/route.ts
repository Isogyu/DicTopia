import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmojiType } from "@/types/database";
import type { ReactRequest, ReactResponse } from "@/types/api";

const emojiTypes: EmojiType[] = ["fire", "laugh", "cry", "clap"];

const reactSchema = z.object({
  emoji_type: z.enum(["fire", "laugh", "cry", "clap"], {
    message: "絵文字タイプは fire / laugh / cry / clap のいずれかを指定してください",
  }),
});

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
      { success: false, error: parse.error.issues[0]?.message ?? "不正な入力です" } as ReactResponse,
      { status: 400 }
    );
  }

  const { emoji_type } = parse.data;

  const supabase = createAdminClient();

  const { error: insertError } = await supabase
    .from("reactions")
    .insert({ word_id: wordId, emoji_type });

  if (insertError) {
    if (insertError.code === "23503") {
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

  return NextResponse.json(
    { success: true } as ReactResponse,
    { status: 201 }
  );
}
