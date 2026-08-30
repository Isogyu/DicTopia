import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateVoterHash } from "@/lib/hash";
import type { VoteResponse, VoteStatusResponse } from "@/types/api";

const DUPLICATE_VOTE_ERROR = "本日はこの造語にすでに投票済みです";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json(
      { error: "造語が見つかりません" },
      { status: 404 }
    );
  }

  const wordId = params.id;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const voterHash = generateVoterHash(ip, userAgent);

  const supabase = createAdminClient();

  const [{ data: vote }, { data: word }] = await Promise.all([
    supabase
      .from("votes")
      .select("id")
      .eq("word_id", wordId)
      .eq("voter_hash", voterHash)
      .maybeSingle(),
    supabase
      .from("words")
      .select("votes_count")
      .eq("id", wordId)
      .eq("is_published", true)
      .maybeSingle(),
  ]);

  if (!word) {
    return NextResponse.json(
      { error: "造語が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    voted: Boolean(vote),
    votes_count: word.votes_count,
  } as VoteStatusResponse);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uuidParse = z.string().uuid().safeParse(params.id);
  if (!uuidParse.success) {
    return NextResponse.json(
      { success: false, error: "造語が見つかりません" } as VoteResponse,
      { status: 404 }
    );
  }

  const wordId = params.id;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const voterHash = generateVoterHash(ip, userAgent);

  const supabase = createAdminClient();

  const { error: insertError } = await supabase
    .from("votes")
    .insert({ word_id: wordId, voter_hash: voterHash });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { success: false, error: DUPLICATE_VOTE_ERROR } as VoteResponse,
        { status: 429 }
      );
    }

    if (insertError.code === "23503") {
      return NextResponse.json(
        { success: false, error: "造語が見つかりません" } as VoteResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "投票に失敗しました。時間をおいて再度お試しください" } as VoteResponse,
      { status: 500 }
    );
  }

  const { data, error: rpcError } = await supabase.rpc(
    "increment_votes_count",
    { target_word_id: wordId }
  );

  if (rpcError || data === null) {
    return NextResponse.json(
      { success: false, error: "造語が見つかりません" } as VoteResponse,
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, votes_count: data } as VoteResponse,
    { status: 200 }
  );
}
