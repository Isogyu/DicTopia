import { createClient } from "@/lib/supabase/server";
import { HeroTopicCard } from "@/components/home/hero-topic-card";
import { Leaderboard } from "@/components/home/leaderboard";
import { NewestList } from "@/components/home/newest-list";
import type { Topic, Word } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const { data: activeTopic } = await supabase
    .from("topics")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { data: topWords } = await supabase
    .from("words")
    .select("*")
    .eq("is_published", true)
    .order("votes_count", { ascending: false })
    .limit(10);

  const { data: newestWords } = await supabase
    .from("words")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col">
      <HeroTopicCard topic={activeTopic as Topic | null} />
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-2">
        <Leaderboard words={(topWords as Word[]) ?? []} />
        <NewestList words={(newestWords as Word[]) ?? []} />
      </div>
    </div>
  );
}
