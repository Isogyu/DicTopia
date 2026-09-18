import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/lib/categories";
import {
  BrowsePage,
  parsePage,
  parseSort,
} from "@/components/words/browse-page";

export const revalidate = 60;

/** カテゴリ数は固定なので全ページを事前生成する */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

type Params = { category: string };
type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const category = categoryBySlug(params.category);
  if (!category) return { title: "カテゴリが見つかりません" };

  const page = parsePage(searchParams.page);
  const base = `/words/${category.slug}`;

  return {
    title: `${category.value}の造語一覧`,
    description: category.description,
    alternates: { canonical: page > 1 ? `${base}?page=${page}` : base },
    openGraph: {
      title: `${category.value}の造語一覧｜DicTopia`,
      description: category.description,
      images: [
        `/api/og?title=${encodeURIComponent(`${category.value}の造語`)}`,
      ],
    },
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const category = categoryBySlug(params.category);
  if (!category) notFound();

  return (
    <BrowsePage
      title={`${category.emoji} ${category.value}の造語`}
      description={category.description}
      categorySlug={category.slug}
      categoryValue={category.value}
      sort={parseSort(searchParams.sort)}
      page={parsePage(searchParams.page)}
    />
  );
}
