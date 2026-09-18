import type { Category } from "@/types/database";

/**
 * カテゴリの単一の情報源。
 * DB の CHECK 制約 / zod スキーマ / UI のタブがここからずれないよう、
 * ラベルはこの配列を唯一の定義とする。
 */
export interface CategoryMeta {
  /** DB に保存される値。日本語のまま。 */
  value: Category;
  /** URL に使う ASCII スラッグ（日本語を URL に入れないため） */
  slug: string;
  emoji: string;
  /** 一覧ページの説明文（SEO のための独自テキスト） */
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    value: "ライフスタイル",
    slug: "lifestyle",
    emoji: "🏠",
    description:
      "暮らし・習慣・日常のちょっとした行動を言い当てる造語を集めました。",
  },
  {
    value: "感情・感性",
    slug: "emotion",
    emoji: "💭",
    description:
      "名前のなかった気持ちに名前をつける。感情や感覚を表す造語のコレクションです。",
  },
  {
    value: "仕事・ビジネス",
    slug: "work",
    emoji: "💼",
    description:
      "会議・リモートワーク・職場のあるあるを表現する、仕事まわりの造語です。",
  },
  {
    value: "ネット・SNS",
    slug: "internet",
    emoji: "📱",
    description:
      "SNS・アルゴリズム・オンラインコミュニケーションから生まれた造語です。",
  },
  {
    value: "恋愛・人間関係",
    slug: "relationship",
    emoji: "💞",
    description:
      "恋愛や友人・家族との関係のなかで生まれる機微を捉えた造語です。",
  },
  {
    value: "その他",
    slug: "other",
    emoji: "✨",
    description: "どのカテゴリにも収まらない、自由な発想の造語たちです。",
  },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [
  Category,
  ...Category[],
];

export function categoryBySlug(slug: string | undefined | null) {
  if (!slug) return undefined;
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByValue(value: string | undefined | null) {
  if (!value) return undefined;
  return CATEGORIES.find((c) => c.value === value);
}

export function categorySlug(value: string | undefined | null): string {
  return categoryByValue(value)?.slug ?? "other";
}
