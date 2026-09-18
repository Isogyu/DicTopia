"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { categorySlug } from "@/lib/categories";
import { RelativeTime } from "@/components/ui/relative-time";
import { VoteButton } from "./vote-button";
import { ReactionBar } from "./reaction-bar";
import { ShareButton } from "./share-button";
import { ReportFlag } from "./report-flag";
import type { Word } from "@/types/database";

interface WordCardProps {
  word: Word;
  /** grid: カード / list: 1 列表示 */
  variant?: "grid" | "list";
  rank?: number;
}

/** 上位 3 位だけ色を変えて、ランキングの視認性を上げる */
const RANK_STYLE: Record<number, string> = {
  1: "bg-amber-100 text-amber-800",
  2: "bg-slate-200 text-slate-700",
  3: "bg-orange-100 text-orange-800",
};

export function WordCard({ word, variant = "list", rank }: WordCardProps) {
  const [votesCount, setVotesCount] = useState(word.votes_count);
  const [reactionsCount, setReactionsCount] = useState(
    word.reactions_count ?? 0
  );

  const isNew =
    Date.now() - new Date(word.created_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 text-card-foreground transition-all hover:border-primary/40 hover:shadow-md",
        variant === "grid" && "flex h-full flex-col"
      )}
    >
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
              RANK_STYLE[rank] ?? "bg-muted text-muted-foreground"
            )}
            aria-label={`${rank}位`}
          >
            {rank}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Link
              href={`/words/${categorySlug(word.category)}`}
              className="relative z-10 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {word.category}
            </Link>
            {isNew && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                NEW
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold leading-snug">
            {/* カード全体をリンク領域にしつつ、内側のボタンは押せるようにする */}
            <Link
              href={`/word/${word.id}`}
              className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {word.word}
            </Link>
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {word.definition}
          </p>

          {word.example_sentence && (
            <p className="mt-2 line-clamp-1 border-l-2 border-border pl-2 text-xs italic text-muted-foreground/90">
              {word.example_sentence}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>by {word.nickname || "名無し"}</span>
            <span aria-hidden="true">・</span>
            <RelativeTime value={word.created_at} />
            <span aria-hidden="true">・</span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" aria-hidden="true" />
              {word.comments_count ?? 0}
            </span>
            {reactionsCount > 0 && (
              <>
                <span aria-hidden="true">・</span>
                <span>リアクション {reactionsCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2",
          variant === "grid" && "mt-auto"
        )}
      >
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
          />
          <ReportFlag wordId={word.id} word={word.word} />
        </div>
      </div>
    </article>
  );
}
