"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Word } from "@/types/database";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/words/search?q=${encodeURIComponent(query)}`
        );
        const body = (await res.json()) as { words: Word[] };
        setResults(body.words ?? []);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="造語を検索"
          className="w-full rounded-full border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="造語を検索"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-40 mt-2 w-full rounded-lg border border-border bg-card p-2 shadow-lg">
          {query.trim().length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              キーワードを入力してください
            </p>
          ) : results.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              該当する新語が見つかりませんでした
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((word) => (
                <li key={word.id}>
                  <Link
                    href={`/word/${word.id}`}
                    className="block rounded-md p-2 text-sm hover:bg-muted"
                    onClick={() => setShowDropdown(false)}
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
        </div>
      )}
    </div>
  );
}
