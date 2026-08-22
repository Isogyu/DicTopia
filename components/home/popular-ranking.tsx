import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

interface PopularRankingProps {
  words: Word[];
}

export function PopularRanking({ words }: PopularRankingProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">人気ランキング</h2>
      <div className="space-y-4">
        {words.slice(0, 5).map((word, index) => (
          <WordCard key={word.id} word={word} variant="leaderboard" rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
