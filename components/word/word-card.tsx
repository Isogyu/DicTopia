import Link from "next/link";
import type { Word } from "@/types/database";

interface WordCardProps {
  word: Word;
  variant?: "leaderboard" | "newest" | "detail";
  rank?: number;
}

export function WordCard({ word, variant = "newest", rank }: WordCardProps) {
  const isLeaderboard = variant === "leaderboard";

  return (
    <Link
      href={`/word/${word.id}`}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-start gap-4">
        {isLeaderboard && rank !== undefined && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {rank}
          </span>
        )}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold group-hover:text-primary">
              {word.word}
            </h3>
            <span className="text-sm text-muted-foreground">
              票数 {word.votes_count}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {word.definition}
          </p>
          {word.example_sentence && (
            <p className="line-clamp-1 text-xs text-muted-foreground/80">
              {word.example_sentence}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
