import { createPublicClient } from "@/lib/supabase/public";
import { sanitizeSearchTerm, ilikeFilter } from "@/lib/supabase/filters";
import type { Word } from "@/types/database";

/** カード表示に必要なカウントを 1 クエリでまとめて取るための select 句 */
const WORD_SELECT = "*, comments(count), reactions(count)";

type WordWithCounts = Word & {
  comments?: { count: number }[];
  reactions?: { count: number }[];
};

export function normalizeCounts(item: WordWithCounts): Word {
  const { comments, reactions, ...rest } = item;
  return {
    ...(rest as Word),
    comments_count: comments?.[0]?.count ?? 0,
    reactions_count: reactions?.[0]?.count ?? 0,
  };
}

export type SortKey = "newest" | "popular";

export interface ListWordsOptions {
  sort?: SortKey;
  category?: string;
  limit?: number;
  offset?: number;
  /** 除外したい ID（関連造語で自分自身を外す用途） */
  excludeId?: string;
}

export interface ListWordsResult {
  words: Word[];
  total: number;
}

export async function listWords({
  sort = "newest",
  category,
  limit = 24,
  offset = 0,
  excludeId,
}: ListWordsOptions = {}): Promise<ListWordsResult> {
  const supabase = createPublicClient();

  let query = supabase
    .from("words")
    .select(WORD_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (category) {
    query = query.eq("category", category);
  }
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  query =
    sort === "popular"
      ? query.order("votes_count", { ascending: false }).order("created_at", {
          ascending: false,
        })
      : query.order("created_at", { ascending: false });

  const { data, count } = await query.range(offset, offset + limit - 1);

  return {
    words: ((data as WordWithCounts[]) ?? []).map(normalizeCounts),
    total: count ?? 0,
  };
}

export interface SearchWordsResult extends ListWordsResult {
  /** 予約文字を除去した結果、検索語として成立しなかった場合に true */
  empty: boolean;
}

export async function searchWords(
  rawQuery: string,
  { limit = 30, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<SearchWordsResult> {
  const term = sanitizeSearchTerm(rawQuery);
  if (term.length === 0) {
    return { words: [], total: 0, empty: true };
  }

  const supabase = createPublicClient();

  const { data, count } = await supabase
    .from("words")
    .select(WORD_SELECT, { count: "exact" })
    .eq("is_published", true)
    .or(
      [
        ilikeFilter("word", term),
        ilikeFilter("definition", term),
        ilikeFilter("example_sentence", term),
      ].join(",")
    )
    .order("votes_count", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    words: ((data as WordWithCounts[]) ?? []).map(normalizeCounts),
    total: count ?? 0,
    empty: false,
  };
}

export async function getWord(id: string): Promise<Word | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("words")
    .select(WORD_SELECT)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return data ? normalizeCounts(data as WordWithCounts) : null;
}

/** sitemap 用。公開済みの ID と更新日時だけを軽量に取得する。 */
export async function listWordSitemapEntries(): Promise<
  { id: string; created_at: string }[]
> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("words")
    .select("id, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5000);

  return (data as { id: string; created_at: string }[]) ?? [];
}
