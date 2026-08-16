import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

interface LeaderboardProps {
  words: Word[];
}

export function Leaderboard({ words }: LeaderboardProps) {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="mb-6 text-xl font-bold">今週のバズ造語 Top 10</h2>
      {words.length === 0 ? (
        <p className="text-muted-foreground">まだ投票がありません。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {words.map((word, index) => (
            <WordCard
              key={word.id}
              word={word}
              variant="leaderboard"
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
