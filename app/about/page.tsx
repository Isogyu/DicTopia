import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "使い方とガイドライン",
  description:
    "DicTopia の使い方。造語の投稿方法、投票・リアクション・コメントの仕組み、投稿ガイドラインを説明します。ログインは不要です。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "使い方とガイドライン｜DicTopia",
    description:
      "造語の投稿方法、投票・リアクション・コメントの仕組み、投稿ガイドラインを説明します。",
    images: [`/api/og?title=${encodeURIComponent("使い方とガイドライン")}`],
  },
};

const STEPS = [
  {
    title: "思いついた言葉を書く",
    body: "画面上部の「新語を追加」から、造語とその意味を入力します。アカウント登録もログインも不要で、30 秒あれば投稿できます。",
  },
  {
    title: "例文を添える",
    body: "「どんな場面で使うか」がわかると、読み手に一気に伝わります。任意項目ですが、投票が集まりやすくなります。",
  },
  {
    title: "シェアして広める",
    body: "投稿直後に表示されるシェアボタンから X やリンクで共有できます。見た人が投票・コメントすることで、造語が育ちます。",
  },
  {
    title: "人気の言葉は殿堂入り",
    body: "投票を集めた造語は人気ランキングに並び、上位の言葉は殿堂入りページに掲載されます。",
  },
];

const FAQ = [
  {
    q: "アカウント登録は必要ですか？",
    a: "不要です。ニックネームも任意で、未入力の場合は「名無し」として表示されます。",
  },
  {
    q: "投票は何回できますか？",
    a: "1 つの造語につき 1 日 1 回です。日付が変わるとまた投票できます。",
  },
  {
    q: "投稿した造語を消したいときは？",
    a: "現在ユーザー自身による削除機能はありません。問題のある投稿は通報機能からご連絡ください。",
  },
  {
    q: "どんな投稿が削除されますか？",
    a: "差別的・暴力的な表現、特定の個人を攻撃する内容、スパムは対象です。通報が一定数集まった投稿は自動的に非公開になります。",
  },
];

export default function AboutPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        DicTopia の使い方
      </h1>
      <p className="mt-3 text-muted-foreground">
        DicTopia
        は、まだ辞書にない言葉をみんなで作って育てるコミュニティ辞典です。
        難しい手順はありません。思いついた言葉を書くだけで参加できます。
      </p>

      <section className="mt-10" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-xl font-bold">
          4 ステップで参加できます
        </h2>
        <ol className="mt-4 space-y-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-xl font-bold">
          カテゴリ
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          投稿時に選ぶカテゴリです。一覧ページから同じテーマの造語をたどれます。
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/words/${category.slug}`}
                className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <p className="font-bold">
                  <span aria-hidden="true" className="mr-1.5">
                    {category.emoji}
                  </span>
                  {category.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="guideline-heading">
        <h2 id="guideline-heading" className="text-xl font-bold">
          投稿ガイドライン
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>・差別的・暴力的な表現、特定の個人や団体を攻撃する内容は禁止です。</li>
          <li>・他人の個人情報や、第三者の権利を侵害する内容は投稿しないでください。</li>
          <li>・同じ造語の連続投稿や宣伝目的の投稿はスパムとして扱います。</li>
          <li>
            ・投稿内容は自動モデレーションを通過したうえで公開され、通報が一定数に達した投稿は自動的に非公開になります。
          </li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-xl font-bold">
          よくある質問
        </h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-border bg-card p-5"
            >
              <dt className="font-bold">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 rounded-xl bg-primary p-8 text-center text-primary-foreground">
        <p className="text-lg font-bold">さっそく作ってみましょう</p>
        <Link
          href="/words"
          className="mt-4 inline-flex h-12 items-center rounded-lg bg-background px-6 font-medium text-primary hover:bg-background/90"
        >
          みんなの造語を見る
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </div>
  );
}
