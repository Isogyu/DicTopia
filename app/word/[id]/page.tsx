import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { getWord, listWords } from "@/lib/words";
import { absoluteUrl } from "@/lib/site";
import { categorySlug } from "@/lib/categories";
import { WordDetail } from "@/components/word/word-detail";
import { WordCard } from "@/components/word/word-card";
import { CommentList } from "@/components/comments/comment-list";
import { CommentForm } from "@/components/comments/comment-form";
import type { Comment } from "@/types/database";

// 造語ページは検索流入の受け皿。ISR でキャッシュしつつ、
// コメント投稿時は API 側の revalidatePath で即時更新する。
export const revalidate = 300;

type WordPageParams = { id: string };

const uuid = z.string().uuid();

export async function generateMetadata({
  params,
}: {
  params: WordPageParams;
}): Promise<Metadata> {
  if (!uuid.safeParse(params.id).success) {
    return { title: "ページが見つかりません" };
  }

  const word = await getWord(params.id);
  if (!word) {
    return { title: "ページが見つかりません", robots: { index: false } };
  }

  const path = `/word/${params.id}`;
  const ogImage = absoluteUrl(`/api/og/word/${params.id}`);
  // 検索結果に出たときに、語だけでなく意味まで読めるようにする
  const description = `「${word.word}」とは：${word.definition}${
    word.example_sentence ? `（例：${word.example_sentence}）` : ""
  }`.slice(0, 160);

  return {
    title: `${word.word}とは？意味・使い方`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${word.word}｜DicTopia`,
      description,
      url: absoluteUrl(path),
      images: [{ url: ogImage, width: 1200, height: 630, alt: word.word }],
      publishedTime: word.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: `${word.word}｜DicTopia`,
      description,
      images: [ogImage],
    },
  };
}

async function getComments(wordId: string): Promise<Comment[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("word_id", wordId)
      .order("created_at", { ascending: false })
      .limit(100);

    return (data as Comment[]) ?? [];
  } catch {
    return [];
  }
}

export default async function WordPage({
  params,
}: {
  params: WordPageParams;
}) {
  if (!uuid.safeParse(params.id).success) notFound();

  const word = await getWord(params.id);
  if (!word) notFound();

  const [comments, related] = await Promise.all([
    getComments(word.id),
    // 同カテゴリの人気語を並べ、回遊と内部リンクの両方を作る
    listWords({
      sort: "popular",
      category: word.category,
      limit: 3,
      excludeId: word.id,
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word.word,
    description: word.definition,
    url: absoluteUrl(`/word/${word.id}`),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "DicTopia",
      url: absoluteUrl("/"),
    },
    termCode: word.id,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: word.category,
        item: absoluteUrl(`/words/${categorySlug(word.category)}`),
      },
      { "@type": "ListItem", position: 3, name: word.word },
    ],
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="パンくずリスト" className="mb-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/words/${categorySlug(word.category)}`}
              className="hover:text-foreground"
            >
              {word.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{word.word}</li>
        </ol>
      </nav>

      <WordDetail word={word} />

      {word.ai_search_summary && (
        <section className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            AI による解説
          </h2>
          <p className="text-sm leading-relaxed">{word.ai_search_summary}</p>
        </section>
      )}

      <section className="mt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="mb-4 text-lg font-bold">
          コメント
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
              {comments.length}
            </span>
          )}
        </h2>
        <CommentList comments={comments} />
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <CommentForm wordId={word.id} />
        </div>
      </section>

      {related.words.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-lg font-bold">
            {word.category}の人気の造語
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.words.map((item) => (
              <WordCard key={item.id} word={item} variant="grid" />
            ))}
          </div>
          <Link
            href={`/words/${categorySlug(word.category)}`}
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            {word.category}の造語をもっと見る →
          </Link>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}
