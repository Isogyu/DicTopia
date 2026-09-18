import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizeCounts } from "@/lib/words";
import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

export const revalidate = 300;

/** 殿堂入りに載せる上限 */
const HALL_SIZE = 30;
/** 殿堂入りの足切り票数。これ未満は「まだ育っていない」扱い。 */
const MIN_VOTES = 1;

export const metadata: Metadata = {
  title: "殿堂入りの造語",
  description:
    "DicTopia で最も多くの投票を集めた造語たち。人気の新語・ネットスラングをランキング形式で紹介します。",
  alternates: { canonical: "/hall-of-fame" },
  openGraph: {
    title: "殿堂入りの造語｜DicTopia",
    description: "DicTopia で最も多くの投票を集めた造語ランキング。",
    images: [`/api/og?title=${encodeURIComponent("殿堂入りの造語")}`],
  },
};

export default async function HallOfFamePage() {
  const supabase = createPublicClient();

  // 従来は全件取得してからアプリ側で絞っていたため、
  // 投稿が増えるほど転送量と処理時間が線形に悪化していた。
  const { data } = await supabase
    .from("words")
    .select("*, comments(count), reactions(count)")
    .eq("is_published", true)
    .gte("votes_count", MIN_VOTES)
    .order("votes_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(HALL_SIZE);

  const words = ((data as Word[]) ?? []).map((w) =>
    normalizeCounts(w as Parameters<typeof normalizeCounts>[0])
  );

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DicTopia 殿堂入りの造語",
    itemListElement: words.slice(0, 10).map((word, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: word.word,
      url: `/word/${word.id}`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">殿堂入りの造語</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        DicTopia
        で最も多くの投票を集めた造語です。投票が集まるとここに掲載されます。
      </p>

      {words.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            まだ殿堂入りの造語はありません。投票が集まった造語がここに並びます。
          </p>
          <Link
            href="/words"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            造語一覧を見る
          </Link>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {words.map((word, index) => (
            <li key={word.id}>
              <WordCard word={word} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
    </div>
  );
}
