import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
        このページは見つかりませんでした
      </h1>
      <p className="mt-3 text-muted-foreground">
        造語が削除されたか、URL が間違っている可能性があります。
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
        >
          トップページへ
        </Link>
        <Link
          href="/words"
          className="inline-flex h-12 items-center rounded-lg border border-border px-6 font-medium hover:border-primary hover:text-primary"
        >
          造語一覧を見る
        </Link>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/words/${category.slug}`}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.value}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
