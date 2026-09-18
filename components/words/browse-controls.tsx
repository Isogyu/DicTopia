import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import type { SortKey } from "@/lib/words";

/**
 * カテゴリ・並び替えの切り替え。
 * クライアント JS を使わず素のリンクにすることで、
 * クローラーが各カテゴリのページへ到達できるようにする。
 */
export function BrowseControls({
  activeSlug,
  sort,
}: {
  /** null は「すべて」 */
  activeSlug: string | null;
  sort: SortKey;
}) {
  const sortSuffix = sort === "popular" ? "?sort=popular" : "";

  const tabs = [
    { slug: null, label: "すべて", emoji: "🗂" },
    ...CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.value,
      emoji: c.emoji,
    })),
  ];

  return (
    <div className="space-y-4">
      <nav aria-label="カテゴリ">
        <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const href = tab.slug
              ? `/words/${tab.slug}${sortSuffix}`
              : `/words${sortSuffix}`;
            const active = tab.slug === activeSlug;
            return (
              <li key={tab.slug ?? "all"} className="snap-start">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary hover:text-primary"
                  )}
                >
                  <span aria-hidden="true">{tab.emoji}</span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="inline-flex rounded-lg border border-border p-0.5"
        role="group"
        aria-label="並び替え"
      >
        {(
          [
            { key: "newest", label: "新着順" },
            { key: "popular", label: "人気順" },
          ] as { key: SortKey; label: string }[]
        ).map(({ key, label }) => {
          const base = activeSlug ? `/words/${activeSlug}` : "/words";
          const href = key === "popular" ? `${base}?sort=popular` : base;
          const active = sort === key;
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Pagination({
  basePath,
  sort,
  page,
  totalPages,
}: {
  basePath: string;
  sort: SortKey;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    if (sort === "popular") params.set("sort", "popular");
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="ページ送り"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          前へ
        </Link>
      ) : (
        <span className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground opacity-50">
          前へ
        </span>
      )}

      <span className="text-sm text-muted-foreground tabular-nums">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          次へ
        </Link>
      ) : (
        <span className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground opacity-50">
          次へ
        </span>
      )}
    </nav>
  );
}
