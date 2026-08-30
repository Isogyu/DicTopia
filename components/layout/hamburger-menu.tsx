"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import type { Word } from "@/types/database";

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/words/search?q=${encodeURIComponent(q)}`
        );
        const body = (await res.json()) as { words: Word[] };
        setResults(body.words ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-border bg-background p-6 shadow-lg sm:w-96">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold">メニュー</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="mobile-search"
                  className="mb-2 block text-sm font-medium"
                >
                  造語を検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="mobile-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="造語を検索"
                    className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="造語を検索"
                  />
                </div>
              </div>

              {query.trim().length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  キーワードを入力してください
                </p>
              ) : loading ? (
                <p className="text-sm text-muted-foreground">検索中...</p>
              ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  該当する新語が見つかりませんでした
                </p>
              ) : (
                <ul className="max-h-60 space-y-2 overflow-y-auto">
                  {results.map((word) => (
                    <li key={word.id}>
                      <Link
                        href={`/word/${word.id}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-md p-2 text-sm hover:bg-muted"
                      >
                        <span className="font-semibold">{word.word}</span>
                        <span className="ml-2 line-clamp-1 text-muted-foreground">
                          {word.definition}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <nav className="border-t border-border pt-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      ホーム
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hall-of-fame"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      殿堂入り
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/coming-soon"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      使い方（近日公開）
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
