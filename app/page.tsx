import { createPublicClient } from "@/lib/supabase/public";
import { listWords } from "@/lib/words";
import { getActiveTopic } from "@/lib/topics";
import { FEATURE_WEEKLY_TOPIC } from "@/lib/config";
import { Hero } from "@/components/home/hero";
import { HeroTopicCard } from "@/components/home/hero-topic-card";
import { NewestWords } from "@/components/home/newest-words";
import { PopularRanking } from "@/components/home/popular-ranking";
import { RecentComments } from "@/components/home/recent-comments";
import { BottomCta } from "@/components/home/bottom-cta";
import type { CommentWithWord } from "@/types/database";

// 投稿の反映速度と配信コストの折衷。
// 投稿・コメント API 側で revalidatePath するため、実際の反映はほぼ即時。
export const revalidate = 60;

async function getRecentComments(): Promise<CommentWithWord[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("comments")
      .select("*, words!inner(word, is_published)")
      .eq("words.is_published", true)
      .order("created_at", { ascending: false })
      .limit(4);

    return (data as CommentWithWord[]) ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [activeTopic, newest, popular, recentComments] = await Promise.all([
    getActiveTopic(),
    listWords({ sort: "newest", limit: 6 }),
    listWords({ sort: "popular", limit: 5 }),
    getRecentComments(),
  ]);

  return (
    <div className="flex flex-col">
      {FEATURE_WEEKLY_TOPIC ? (
        <HeroTopicCard topic={activeTopic} />
      ) : (
        <Hero
          totalWords={newest.total}
          sampleWords={newest.words.slice(0, 3).map((w) => ({
            id: w.id,
            word: w.word,
            definition: w.definition,
          }))}
        />
      )}
      <NewestWords words={newest.words.slice(0, 6)} />
      <PopularRanking words={popular.words} />
      <RecentComments comments={recentComments} />
      <BottomCta />
    </div>
  );
}
