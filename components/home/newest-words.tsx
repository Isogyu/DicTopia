import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

interface NewestWordsProps {
  words: Word[];
}

export function NewestWords({ words }: NewestWordsProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">新着造語</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {words.slice(0, 3).map((word) => (
          <WordCard key={word.id} word={word} variant="grid" />
        ))}
      </div>
    </section>
  );
}
