"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { NAV_LINKS } from "./navbar";

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="メニュー"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold">メニュー</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="サイトメニュー">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                  >
                    ホーム
                  </Link>
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                カテゴリから探す
              </p>
              <ul className="space-y-1">
                {CATEGORIES.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/words/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted"
                    >
                      <span aria-hidden="true">{category.emoji}</span>
                      {category.value}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
