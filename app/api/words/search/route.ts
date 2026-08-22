import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Word } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length === 0) {
    return NextResponse.json({ error: "検索語を入力してください" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("is_published", true)
    .or(`word.ilike.%${q}%,definition.ilike.%${q}%`)
    .order("votes_count", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ words: (data as Word[]) ?? [] });
}
