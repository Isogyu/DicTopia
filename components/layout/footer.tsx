import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { SITE_TAGLINE } from "@/lib/site";

/**
 * フッター。
 * カテゴリへの内部リンクを持たせ、クローラーが全カテゴリへ到達できるようにする。
 */
export function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-border bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-extrabold">DicTopia</p>
          <p className="mt-2 text-sm text-muted-foreground">{SITE_TAGLINE}</p>
        </div>

        <nav aria-labelledby="footer-explore">
          <p id="footer-explore" className="mb-3 text-sm font-semibold">
            さがす
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/words" className="hover:text-foreground">
                造語一覧
              </Link>
            </li>
            <li>
              <Link href="/words?sort=popular" className="hover:text-foreground">
                人気ランキング
              </Link>
            </li>
            <li>
              <Link href="/hall-of-fame" className="hover:text-foreground">
                殿堂入り
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-categories" className="sm:col-span-1">
          <p id="footer-categories" className="mb-3 text-sm font-semibold">
            カテゴリ
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/words/${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.value}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-about">
          <p id="footer-about" className="mb-3 text-sm font-semibold">
            DicTopia について
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                使い方・ガイドライン
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/Isogyu/DicTopia"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border py-4">
        <p className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DicTopia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
