import { WordCard } from "@/components/word/word-card";
import { Section } from "./section";
import type { Word } from "@/types/database";

export function PopularRanking({ words }: { words: Word[] }) {
  if (words.length === 0) return null;

  return (
    <Section
      title="人気ランキング"
      description="投票を集めている造語"
      moreHref="/words?sort=popular"
      moreLabel="ランキングをすべて見る"
    >
      <ol className="space-y-3">
        {words.map((word, index) => (
          <li key={word.id}>
            <WordCard word={word} rank={index + 1} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
