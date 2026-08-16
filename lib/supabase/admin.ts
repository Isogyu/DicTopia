import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 注意: このクライアントはRoute Handler等のサーバーサイドコードでのみ使用すること。
// クライアントコンポーネントに絶対にインポートしないこと（Service Role Keyの漏洩防止）。
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
