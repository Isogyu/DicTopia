import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createWordSchema } from "@/lib/validation";
import { moderateText } from "@/lib/openai/moderation";
import { enrichWord } from "@/lib/openai/enrichment";
import type { Word } from "@/types/database";

const MODERATION_ERROR =
  "公序良俗に反する単語・表現が含まれているため登録できません";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parse = createWordSchema.safeParse(body);

    if (!parse.success) {
      const messages = parse.error.issues.map((issue) => issue.message).join(" / ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    const { word, definition, example_sentence, topic_id } = parse.data;

    const textToModerate = [word, definition, example_sentence]
      .filter((s): s is string => typeof s === "string" && s.length > 0)
      .join("\n\n");

    let flagged: boolean;
    try {
      flagged = await moderateText(textToModerate);
    } catch {
      return NextResponse.json(
        { error: "モデレーションの判定に失敗しました。時間をおいて再度お試しください" },
        { status: 500 }
      );
    }

    if (flagged) {
      return NextResponse.json(
        { success: false, error: MODERATION_ERROR },
        { status: 422 }
      );
    }

    const supabase = createAdminClient();

    const { data: created, error: insertError } = await supabase
      .from("words")
      .insert({
        word,
        definition,
        example_sentence: example_sentence ?? null,
        topic_id: topic_id ?? null,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) {
      if (
        insertError.message?.toLowerCase().includes("foreign key") ||
        insertError.code === "23503"
      ) {
        return NextResponse.json(
          { error: "指定されたお題が存在しません" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "造語の登録に失敗しました。時間をおいて再度お試しください" },
        { status: 500 }
      );
    }

    const createdWord = created as Word;

    // 非同期SEOエンリッチメント：レスポンス返却を待たない
    enrichWord(word, definition, example_sentence)
      .then(async (result) => {
        const client = createAdminClient();
        await client
          .from("words")
          .update({
            ai_context_tags: result.tags,
            ai_search_summary: result.summary,
          })
          .eq("id", createdWord.id);
      })
      .catch(() => {
        // エンリッチメント失敗は主処理に影響しない
      });

    return NextResponse.json(
      { success: true, data: createdWord },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
