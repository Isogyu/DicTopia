import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReporterHash } from "@/lib/hash";
import { clientKey, rateLimit, retryAfterHeaders } from "@/lib/rate-limit";
import { safeRevalidate } from "@/lib/revalidate";
import type { ReportResponse } from "@/types/api";

/** 通報は 3 件で自動非公開になるため、集中的な悪用を防ぐ上限を設ける */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const reportSchema = z.object({
  reason: z.enum(["スパム", "暴言", "不適切", "その他"], {
    message: "通報理由を選択してください",
  }),
  comment: z.string().max(500).optional(),
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

  const limit = rateLimit(
    clientKey(request, "reports:create"),
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "短時間に通報しすぎています。少し時間をおいてお試しください",
      } as ReportResponse,
      { status: 429, headers: retryAfterHeaders(limit) }
    );
  }

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

  const { reason, comment } = parse.data;
  const detail = comment?.trim();
  const storedReason = detail ? `${reason}: ${detail}` : reason;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const reporterHash = generateReporterHash(ip, userAgent);

  const supabase = createAdminClient();

  const { error: insertError } = await supabase.from("reports").insert({
    word_id: wordId,
    reason: storedReason,
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

  if (autoUnpublished) {
    // 非公開になった造語をキャッシュから落とす
    safeRevalidate(`/word/${wordId}`, "/", "/words");
  }

  return NextResponse.json(
    { success: true, auto_unpublished: autoUnpublished } as ReportResponse,
    { status: 201 }
  );
}
