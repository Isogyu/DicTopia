"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Word } from "@/types/database";

interface SearchBarProps {
  /** モバイルのメニュー内などで使う場合に、選択後の後処理を渡す */
  onNavigate?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  onNavigate,
  autoFocus,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // 遅いレスポンスが新しい入力の結果を上書きしないようにする
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/words/search?q=${encodeURIComponent(q)}&limit=6`
        );
        const body = (await res.json()) as { words?: Word[] };
        if (requestId !== requestIdRef.current) return;
        setResults(body.words ?? []);
      } catch {
        if (requestId === requestIdRef.current) setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // 外側クリックで閉じる（blur の setTimeout 頼みをやめる）
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  };

  const submitSearch = () => {
    const q = query.trim();
    if (q.length === 0) return;
    go(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const active = results[activeIndex];
      if (active) {
        go(`/word/${active.id}`);
      } else {
        submitSearch();
      }
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          造語を検索
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={`${listboxId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="造語を検索"
            className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-sm"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
          />
        </div>
      </form>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="検索候補"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl"
        >
          {loading && results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">検索中...</p>
          ) : results.length === 0 ? (
            <div className="p-3">
              <p className="text-sm text-muted-foreground">
                「{query.trim()}」に一致する造語は見つかりませんでした
              </p>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                検索結果ページを開く
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-0.5">
                {results.map((word, index) => (
                  <li key={word.id}>
                    <Link
                      href={`/word/${word.id}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "block rounded-lg px-3 py-2.5 text-sm",
                        index === activeIndex ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <span className="font-semibold">{word.word}</span>
                      <span className="ml-2 line-clamp-1 text-muted-foreground">
                        {word.definition}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted"
              >
                「{query.trim()}」の検索結果をすべて見る
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
