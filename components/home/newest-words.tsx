import { WordCard } from "@/components/word/word-card";
import { Section } from "./section";
import type { Word } from "@/types/database";

export function NewestWords({ words }: { words: Word[] }) {
  if (words.length === 0) return null;

  return (
    <Section
      title="新着造語"
      description="いま生まれたばかりの言葉たち"
      moreHref="/words"
      moreLabel="すべての新着を見る"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {words.map((word) => (
          <WordCard key={word.id} word={word} variant="grid" />
        ))}
      </div>
    </Section>
  );
}
