/**
 * PostgREST の `or()` / `ilike()` に渡す値のサニタイズ。
 *
 * `.or("word.ilike.%foo%")` はフィルタ式を文字列として組み立てるため、
 * ユーザー入力をそのまま埋め込むと `,` `(` `)` `.` などでフィルタ木が壊れ、
 * 任意の条件を注入できてしまう（フィルタインジェクション）。
 * 予約文字を取り除いたうえで `"` 囲みにすることで、
 * 値としてのみ解釈されるようにする。
 */

/** PostgREST のフィルタ式で構文上の意味を持つ文字 */
const RESERVED = /[,()."\\:*]/g;

/** LIKE パターンとしてワイルドカードの意味を持つ文字 */
const LIKE_WILDCARDS = /[%_]/g;

/**
 * or() の中に安全に埋め込める検索語へ変換する。
 * 予約文字と LIKE ワイルドカードを除去するため、
 * 「戻り値が空文字なら検索対象にならない」ことを呼び出し側で判定すること。
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(RESERVED, " ")
    .replace(LIKE_WILDCARDS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 語句を `column.ilike."%term%"` 形式へ組み立てる。
 * ダブルクォートで囲むことで、PostgREST は中身を単一の値として扱う。
 */
export function ilikeFilter(column: string, term: string): string {
  return `${column}.ilike."%${term}%"`;
}
