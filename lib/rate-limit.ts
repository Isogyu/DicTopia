import type { NextRequest } from "next/server";

/**
 * 書き込み系 API の濫用対策（固定ウィンドウ方式）。
 *
 * 現状はプロセス内メモリで保持する。Vercel のサーバーレス関数は
 * インスタンスごとに状態が分かれるため厳密な上限ではないが、
 * 単一クライアントからの連打・スクリプトによる大量投稿のコスト
 * （とくに投稿 API が叩く OpenAI moderation / enrichment の課金）を
 * 実用上十分に抑えられる。
 *
 * 厳密な分散レートリミットが必要になった時点で、
 * この関数の実装だけを Upstash Redis / Vercel KV に差し替えればよい。
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** メモリ肥大を防ぐため、期限切れエントリを間引く */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

export interface RateLimitResult {
  ok: boolean;
  /** 残り試行回数 */
  remaining: number;
  /** ウィンドウが空くまでの秒数（ok === false のとき意味を持つ） */
  retryAfter: number;
}

/** テスト実行時は無効化する（1 プロセス内で多数のリクエストを流すため） */
const DISABLED =
  process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true";

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  if (DISABLED) {
    return { ok: true, remaining: limit, retryAfter: 0 };
  }

  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * クライアント識別子。Vercel では x-forwarded-for の先頭が実 IP。
 * 取得できない場合も一律のキーにまとめ、匿名の大量投稿を止められるようにする。
 */
export function clientKey(request: NextRequest, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

/** 429 レスポンス用の共通ヘッダ */
export function retryAfterHeaders(result: RateLimitResult): HeadersInit {
  return { "Retry-After": String(Math.max(1, result.retryAfter)) };
}
