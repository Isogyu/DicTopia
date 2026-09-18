import { createPublicClient } from "@/lib/supabase/public";
import { FEATURE_WEEKLY_TOPIC } from "@/lib/config";
import type { Topic } from "@/types/database";

/**
 * 有効なお題を 1 件取得する。
 * 週替わりお題が無効な場合はクエリ自体を行わない
 * （従来はフラグ OFF でも毎回問い合わせていた）。
 */
export async function getActiveTopic(): Promise<Topic | null> {
  if (!FEATURE_WEEKLY_TOPIC) return null;

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    return (data as Topic | null) ?? null;
  } catch {
    return null;
  }
}
