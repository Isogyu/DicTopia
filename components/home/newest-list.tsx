import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

interface NewestListProps {
  words: Word[];
}

export function NewestList({ words }: NewestListProps) {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="mb-6 text-xl font-bold">新着造語</h2>
      {words.length === 0 ? (
        <p className="text-muted-foreground">まだ造語が投稿されていません。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {words.map((word) => (
            <WordCard key={word.id} word={word} variant="newest" />
          ))}
        </div>
      )}
    </section>
  );
}
