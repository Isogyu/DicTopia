import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WordCard } from "@/components/word/word-card";
import type { Word } from "@/types/database";

export const dynamic = "force-dynamic";

type WordPageParams = {
  id: string;
};

export async function generateMetadata({
  params,
}: {
  params: WordPageParams;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data: word } = await supabase
    .from("words")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!word) {
    return { title: "Not Found - DicTopia" };
  }

  const w = word as Word;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return { title: `${w.word} - DicTopia` };
  }

  const ogImage = `${siteUrl}/api/og/word/${params.id}`;

  return {
    title: `${w.word} - DicTopia`,
    description: w.definition,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: w.word,
      description: w.definition,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: w.word,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: w.word,
      description: w.definition,
      images: [ogImage],
    },
  };
}

export default async function WordPage({
  params,
}: {
  params: WordPageParams;
}) {
  const supabase = await createClient();
  const { data: word } = await supabase
    .from("words")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!word) {
    notFound();
  }

  const w = word as Word;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: w.word,
    description: w.definition,
    url: `${siteUrl}/word/${w.id}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "DicTopia",
    },
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <WordCard word={w} variant="detail" />

      {w.ai_search_summary && (
        <section className="mt-8 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            この造語についてのAI要約
          </h2>
          <p className="text-sm">{w.ai_search_summary}</p>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
