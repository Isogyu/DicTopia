import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCommentSchema } from "@/lib/validation";
import { moderateText } from "@/lib/openai/moderation";
import { generateCommenterHash } from "@/lib/hash";
import type { CreateCommentResponse } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("word_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = createCommentSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const { body: commentBody, nickname } = parseResult.data;

  const supabase = createAdminClient();

  const { data: word } = await supabase
    .from("words")
    .select("id, is_published")
    .eq("id", params.id)
    .maybeSingle();

  if (!word || !word.is_published) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const flagged = await moderateText(commentBody);
    if (flagged) {
      const res: CreateCommentResponse = {
        success: false,
        error: "公序良俗に反する表現が含まれているため投稿できません",
      };
      return NextResponse.json(res, { status: 422 });
    }
  } catch {
    return NextResponse.json(
      { error: "モデレーションの判定に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }

  const commenterHash = generateCommenterHash(ip, userAgent);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      word_id: params.id,
      body: commentBody,
      nickname: nickname ?? null,
      commenter_hash: commenterHash,
      user_id: null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "コメントの保存に失敗しました" },
      { status: 500 }
    );
  }

  const res: CreateCommentResponse = { success: true, data };
  return NextResponse.json(res, { status: 201 });
}
