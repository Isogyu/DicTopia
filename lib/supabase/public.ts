import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 認証を伴わない公開読み取り専用クライアント。
 *
 * `lib/supabase/server.ts` は cookies() を使うため、参照したページは必ず
 * 動的レンダリングに落ちる。本アプリにログイン状態は存在せず、
 * anon キー + RLS で見えるのは公開済みデータのみなので、
 * 一覧・詳細・sitemap などの読み取りはこちらを使って ISR を効かせる。
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
