"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [votesCount, setVotesCount] = useState(word.votes_count);

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/50">
      <div className="flex items-start gap-4">
        {isLeaderboard && rank !== undefined && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {rank}
          </span>
        )}
        <div className="flex-1 space-y-2">
          <Link
            href={`/word/${word.id}`}
            className="block text-lg font-semibold hover:text-primary"
          >
            {word.word}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {word.definition}
          </p>
          {word.example_sentence && (
            <p className="line-clamp-1 text-xs text-muted-foreground/80">
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
