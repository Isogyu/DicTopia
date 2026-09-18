import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { HeroCta } from "./hero-cta";

interface HeroProps {
  /** 公開済みの造語総数。社会的証明として表示する。 */
  totalWords: number;
  /** 直近で投稿された造語（先頭 3 件）。ヒーローで実物を見せる。 */
  sampleWords: { id: string; word: string; definition: string }[];
}

export function Hero({ totalWords, sampleWords }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-gradient-to-br from-indigo-50 via-background to-violet-50">
      <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            ログイン不要・30 秒で投稿できます
          </p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            あなたの造語が、
            <br />
            未来の辞書になる。
          </h1>

          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            まだ名前のない気持ちや現象に、名前をつけてみませんか。
            投稿された造語はみんなの投票で育ち、人気の言葉は殿堂入りします。
          </p>

          <HeroCta />

          {totalWords > 0 && (
            <p className="text-sm text-muted-foreground">
              これまでに
              <strong className="mx-1 text-foreground tabular-nums">
                {totalWords.toLocaleString("ja-JP")}
              </strong>
              語が登録されています
            </p>
          )}

          <ul className="flex flex-wrap gap-2" aria-label="カテゴリから探す">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/words/${category.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <span aria-hidden="true">{category.emoji}</span>
                  {category.value}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 以前はここが単なる紫の四角だった。実際の投稿を見せて中身を伝える。 */}
        <div className="space-y-3">
          {sampleWords.map((word, index) => (
            <Link
              key={word.id}
              href={`/word/${word.id}`}
              className="block rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5 hover:border-primary/40"
              style={{ marginLeft: `${index * 12}px` }}
            >
              <p className="font-bold">{word.word}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {word.definition}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
