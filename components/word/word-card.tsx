"use client";

import { useState } from "react";
import Link from "next/link";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toRelativeTime } from "@/lib/relative-time";
import { VoteButton } from "./vote-button";
import { ReactionBar } from "./reaction-bar";
import { ShareButton } from "./share-button";
import { ReportFlag } from "./report-flag";
import type { Word } from "@/types/database";

interface WordCardProps {
  word: Word;
  variant?: "leaderboard" | "newest" | "detail" | "grid";
  rank?: number;
}

export function WordCard({ word, variant = "newest", rank }: WordCardProps) {
  const isLeaderboard = variant === "leaderboard";
  const isDetail = variant === "detail";
  const isGrid = variant === "grid";
  const [votesCount, setVotesCount] = useState(word.votes_count);
  const [reactionsCount, setReactionsCount] = useState(word.reactions_count ?? 0);

  const isNew =
    Date.now() - new Date(word.created_at).getTime() < 24 * 60 * 60 * 1000;

  const title = isDetail ? (
    <h1 className="text-2xl font-bold">{word.word}</h1>
  ) : (
    <Link
      href={`/word/${word.id}`}
      className="block text-lg font-semibold hover:text-primary"
    >
      {word.word}
    </Link>
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/50",
        isGrid && "flex h-full flex-col"
      )}
    >
      <div className="flex items-start gap-4">
        {isLeaderboard && rank !== undefined && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              rank <= 3
                ? "bg-yellow-100 text-yellow-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            {rank <= 3 ? <Medal className="h-5 w-5" /> : rank}
          </span>
        )}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isNew && (
              <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">
                NEW
              </span>
            )}
            {isGrid && (
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                {word.category}
              </span>
            )}
          </div>

          {title}

          <p
            className={cn(
              "text-sm text-muted-foreground",
              !isDetail && "line-clamp-2"
            )}
          >
            {word.definition}
          </p>

          {word.example_sentence && (
            <p
              className={cn(
                "text-xs text-muted-foreground/80",
                !isDetail && "line-clamp-1"
              )}
            >
              {word.example_sentence}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {word.nickname ?? "名無し"}</span>
            <span>・</span>
            <span>{toRelativeTime(word.created_at)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <VoteButton
              wordId={word.id}
              initialCount={votesCount}
              onSuccess={setVotesCount}
            />
            <ReactionBar
              wordId={word.id}
              onReacted={() => setReactionsCount((c) => c + 1)}
            />
            <ShareButton wordId={word.id} word={word.word} />
            <ReportFlag wordId={word.id} word={word.word} />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>コメント {word.comments_count ?? 0}</span>
            <span>リアクション {reactionsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
