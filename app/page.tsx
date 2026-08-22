import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/home/hero";
import { NewestWords } from "@/components/home/newest-words";
import { PopularRanking } from "@/components/home/popular-ranking";
import { RecentComments } from "@/components/home/recent-comments";
import { HeroTopicCard } from "@/components/home/hero-topic-card";
import { BottomCta } from "@/components/home/bottom-cta";
import { FEATURE_WEEKLY_TOPIC } from "@/lib/config";
import type { Topic, Word, CommentWithWord } from "@/types/database";

export const dynamic = "force-dynamic";

type WordWithCounts = Word & {
  comments: { count: number }[];
  reactions: { count: number }[];
};

function normalizeCounts(item: WordWithCounts): Word {
  return {
    ...item,
    comments_count: item.comments?.[0]?.count ?? 0,
    reactions_count: item.reactions?.[0]?.count ?? 0,
  };
}

export default async function Home() {
  const supabase = await createClient();

  const { data: activeTopic } = await supabase
    .from("topics")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { data: newest } = await supabase
    .from("words")
    .select("*, comments(count), reactions(count)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: popular } = await supabase
    .from("words")
    .select("*, comments(count), reactions(count)")
    .eq("is_published", true)
    .order("votes_count", { ascending: false })
    .limit(5);

  const { data: recentComments } = await supabase
    .from("comments")
    .select("*, words(word)")
    .order("created_at", { ascending: false })
    .limit(5);

  const newestWords = ((newest as WordWithCounts[]) ?? []).map(normalizeCounts);
  const popularWords = ((popular as WordWithCounts[]) ?? []).map(normalizeCounts);
  const recent = (recentComments as CommentWithWord[]) ?? [];

  return (
    <div className="flex flex-col">
      {FEATURE_WEEKLY_TOPIC ? (
        <HeroTopicCard topic={activeTopic as Topic | null} />
      ) : (
        <Hero />
      )}
      <NewestWords words={newestWords} />
      <PopularRanking words={popularWords} />
      <RecentComments comments={recent} />
      <BottomCta />
    </div>
  );
}
