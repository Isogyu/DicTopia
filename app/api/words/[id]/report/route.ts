import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReporterHash } from "@/lib/hash";
import type { ReportRequest, ReportResponse } from "@/types/api";

const reportSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json(
      { success: false, error: "造語が見つかりません" } as ReportResponse,
      { status: 404 }
    );
  }

  const wordId = params.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "リクエストボディを解析できません" } as ReportResponse,
      { status: 400 }
    );
  }

  const parse = reportSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { success: false, error: parse.error.issues[0]?.message ?? "不正な入力です" } as ReportResponse,
      { status: 400 }
    );
  }

  const { reason } = parse.data;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const reporterHash = generateReporterHash(ip, userAgent);

  const supabase = createAdminClient();

  const { error: insertError } = await supabase.from("reports").insert({
    word_id: wordId,
    reason: reason ?? null,
    reporter_hash: reporterHash,
  });

  if (insertError) {
    if (insertError.code === "23503") {
      return NextResponse.json(
        { success: false, error: "造語が見つかりません" } as ReportResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "通報の登録に失敗しました" } as ReportResponse,
      { status: 500 }
    );
  }

  const { data, error: rpcError } = await supabase.rpc(
    "increment_reports_count",
    { target_word_id: wordId }
  );

  if (rpcError || !data) {
    return NextResponse.json(
      { success: false, error: "通報の集計に失敗しました" } as ReportResponse,
      { status: 500 }
    );
  }

  const autoUnpublished = (data as { auto_unpublished: boolean }).auto_unpublished;

  return NextResponse.json(
    { success: true, auto_unpublished: autoUnpublished } as ReportResponse,
    { status: 201 }
  );
}
