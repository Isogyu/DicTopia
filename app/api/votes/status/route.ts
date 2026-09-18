import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateVoterHash } from "@/lib/hash";

export const dynamic = "force-dynamic";

const MAX_IDS = 100;
const uuidSchema = z.string().uuid();

/**
 * 表示中の造語について「今日すでに投票済みか」をまとめて返す。
 *
 * カードごとに `GET /api/words/[id]/vote` を呼ぶ実装を置き換えるためのエンドポイント。
 * 1 ページぶんのカードを 1 クエリで解決する。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("ids") ?? "";

  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => uuidSchema.safeParse(id).success)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ voted: [] });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const voterHash = generateVoterHash(ip, userAgent);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("votes")
    .select("word_id")
    .eq("voter_hash", voterHash)
    .in("word_id", ids);

  if (error) {
    return NextResponse.json({ voted: [] });
  }

  return NextResponse.json(
    { voted: ((data as { word_id: string }[]) ?? []).map((v) => v.word_id) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
