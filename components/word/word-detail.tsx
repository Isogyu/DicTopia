"use client";

import { useState } from "react";
import Link from "next/link";
import { categorySlug } from "@/lib/categories";
import { RelativeTime } from "@/components/ui/relative-time";
import { VoteButton } from "./vote-button";
import { ReactionBar } from "./reaction-bar";
import { ShareButton } from "./share-button";
import { ReportFlag } from "./report-flag";
import type { Word } from "@/types/database";

/**
 * 造語詳細のヒーロー部分。
 *
 * 以前は一覧用の WordCard を `variant="detail"` で流用していたため、
 * ページの主役である造語そのものが 1 行の見出しに埋もれていた。
 * 詳細ページでは語・意味・例文にはっきり階層をつける。
 */
export function WordDetail({ word }: { word: Word }) {
  const [votesCount, setVotesCount] = useState(word.votes_count);
  const [reactionsCount, setReactionsCount] = useState(
    word.reactions_count ?? 0
  );

  return (
    <article className="rounded-2xl border border-border bg-card p-6 text-card-foreground sm:p-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/words/${categorySlug(word.category)}`}
          className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {word.category}
        </Link>
        <span className="text-sm text-muted-foreground">
          by {word.nickname || "名無し"}
        </span>
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          ・
        </span>
        <span className="text-sm text-muted-foreground">
          <RelativeTime value={word.created_at} />
        </span>
      </div>

      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
        {word.word}
      </h1>

      <dl className="mt-6 space-y-5">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            意味
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-base leading-relaxed sm:text-lg">
            {word.definition}
          </dd>
        </div>

        {word.example_sentence && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              例文
            </dt>
            <dd className="mt-1 border-l-2 border-primary/40 pl-3 text-base italic text-muted-foreground">
              {word.example_sentence}
            </dd>
          </div>
        )}
      </dl>

      {word.ai_context_tags && word.ai_context_tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="関連タグ">
          {word.ai_context_tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <VoteButton
          wordId={word.id}
          initialCount={votesCount}
          onSuccess={setVotesCount}
        />
        <ReactionBar
          wordId={word.id}
          onReacted={() => setReactionsCount((c) => c + 1)}
        />
        <div className="ml-auto flex items-center">
          <ShareButton
            wordId={word.id}
            word={word.word}
            definition={word.definition}
            withLabel
          />
          <ReportFlag wordId={word.id} word={word.word} />
        </div>
      </div>
    </article>
  );
}
