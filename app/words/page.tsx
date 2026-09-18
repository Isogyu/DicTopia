import type { Metadata } from "next";
import {
  BrowsePage,
  parsePage,
  parseSort,
} from "@/components/words/browse-page";

export const revalidate = 60;

type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sort = parseSort(searchParams.sort);
  const page = parsePage(searchParams.page);

  const title =
    sort === "popular" ? "造語ランキング（人気順）" : "造語一覧（新着順）";

  return {
    title,
    description:
      "DicTopia に投稿された造語をカテゴリ・新着順・人気順で探せます。気になる言葉に投票して、未来の辞書を一緒に作りましょう。",
    alternates: {
      // ページ送りやソート違いで重複評価されないよう正規 URL を明示する
      canonical: page > 1 ? `/words?page=${page}` : "/words",
    },
  };
}

export default function WordsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sort = parseSort(searchParams.sort);
  const page = parsePage(searchParams.page);

  return (
    <BrowsePage
      title={sort === "popular" ? "造語ランキング" : "造語一覧"}
      description={
        sort === "popular"
          ? "投票を多く集めている造語を上位から並べています。"
          : "新しく投稿された造語を新着順に並べています。カテゴリで絞り込めます。"
      }
      categorySlug={null}
      sort={sort}
      page={page}
    />
  );
}
