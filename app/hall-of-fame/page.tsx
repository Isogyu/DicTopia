import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WordCard } from "@/components/word/word-card";
import type { Topic, Word } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "殿堂入り - DicTopia",
  description: "過去のお題で最も人気を集めた造語たち",
};

export default async function HallOfFamePage() {
  const supabase = await createClient();

  const [{ data: words }, { data: topics }] = await Promise.all([
    supabase
      .from("words")
      .select("*")
      .eq("is_published", true)
      .order("votes_count", { ascending: false }),
    supabase.from("topics").select("*"),
  ]);

  const topicMap = new Map(
    ((topics as Topic[]) ?? []).map((t) => [t.id, t])
  );

  const list = (words as Word[]) ?? [];

  const grouped = list.reduce<Record<string, Word[]>>((acc, word) => {
    const topic = word.topic_id ? topicMap.get(word.topic_id) : null;
    const week = topic?.week_code ?? "その他";
    if (!acc[week]) acc[week] = [];
    acc[week].push(word);
    return acc;
  }, {});

  const weeks = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">殿堂入り</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        各週のお題で最も多くの票を集めた造語を集めました。
      </p>

      {weeks.length === 0 ? (
        <p className="text-muted-foreground">
          まだ殿堂入りとなる造語がありません。
        </p>
      ) : (
        <div className="space-y-10">
          {weeks.map((week) => {
            const topWords = grouped[week].slice(0, 10);
            return (
              <section key={week}>
                <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
                  {week}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {topWords.map((word, index) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      variant="leaderboard"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
