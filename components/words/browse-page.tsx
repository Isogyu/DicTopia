import Link from "next/link";
import { WordCard } from "@/components/word/word-card";
import { listWords, type SortKey } from "@/lib/words";
import { BrowseControls, Pagination } from "./browse-controls";

export const PAGE_SIZE = 24;

export function parseSort(value: string | string[] | undefined): SortKey {
  return value === "popular" ? "popular" : "newest";
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

interface BrowsePageProps {
  title: string;
  description: string;
  /** null は全カテゴリ */
  categorySlug: string | null;
  categoryValue?: string;
  sort: SortKey;
  page: number;
}

/**
 * 造語一覧の共通描画。
 * `/words` と `/words/[category]` の両方から使う。
 */
export async function BrowsePage({
  title,
  description,
  categorySlug,
  categoryValue,
  sort,
  page,
}: BrowsePageProps) {
  const { words, total } = await listWords({
    sort,
    category: categoryValue,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = categorySlug ? `/words/${categorySlug}` : "/words";

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        {total > 0 && (
          <p className="mt-2 text-sm text-muted-foreground tabular-nums">
            {total.toLocaleString("ja-JP")} 語
          </p>
        )}
      </header>

      <BrowseControls activeSlug={categorySlug} sort={sort} />

      {words.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            このカテゴリにはまだ造語がありません。
          </p>
          <Link
            href="/words"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            すべての造語を見る
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <WordCard key={word.id} word={word} variant="grid" />
          ))}
        </div>
      )}

      <Pagination
        basePath={basePath}
        sort={sort}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
