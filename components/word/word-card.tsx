"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VoteButton } from "./vote-button";
import { ReactionBar } from "./reaction-bar";
import { ShareButton } from "./share-button";
import { ReportFlag } from "./report-flag";
import type { Word } from "@/types/database";

interface WordCardProps {
  word: Word;
  variant?: "leaderboard" | "newest" | "detail";
  rank?: number;
}

export function WordCard({ word, variant = "newest", rank }: WordCardProps) {
  const isLeaderboard = variant === "leaderboard";
  const isDetail = variant === "detail";
  const [votesCount, setVotesCount] = useState(word.votes_count);

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
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/50">
      <div className="flex items-start gap-4">
        {isLeaderboard && rank !== undefined && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {rank}
          </span>
        )}
        <div className="flex-1 space-y-3">
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

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <VoteButton
              wordId={word.id}
              initialCount={votesCount}
              onSuccess={setVotesCount}
            />
            <ReactionBar wordId={word.id} />
            <ShareButton wordId={word.id} word={word.word} />
            <ReportFlag wordId={word.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
