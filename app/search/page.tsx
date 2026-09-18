import type { Metadata } from "next";
import Link from "next/link";
import { WordCard } from "@/components/word/word-card";
import { searchWords } from "@/lib/words";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Metadata {
  const q = firstParam(searchParams.q).trim();
  return {
    title: q ? `「${q}」の検索結果` : "造語を検索",
    description: q
      ? `「${q}」に関連する造語の検索結果です。`
      : "DicTopia に投稿された造語を検索できます。",
    // 検索結果ページはインデックスさせず、クロール予算をカテゴリ一覧に回す
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = firstParam(searchParams.q).trim();
  const { words, total, empty } = q
    ? await searchWords(q, { limit: 50 })
    : { words: [], total: 0, empty: true };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        {q ? `「${q}」の検索結果` : "造語を検索"}
      </h1>

      {q && !empty && (
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          {total.toLocaleString("ja-JP")} 件
        </p>
      )}

      {words.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <WordCard key={word.id} word={word} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8">
          <p className="text-muted-foreground">
            {q
              ? `「${q}」に一致する造語は見つかりませんでした。`
              : "上部の検索バーからキーワードを入力してください。"}
          </p>

          {/* 行き止まりにせず、必ず次の行動を用意する */}
          <p className="mt-4 text-sm font-medium">カテゴリから探す</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/words/${category.slug}`}
                  className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <span aria-hidden="true">{category.emoji}</span>
                  {category.value}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
