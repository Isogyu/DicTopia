"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSubmission } from "@/components/submission/submission-provider";
import { SearchBar } from "./search-bar";
import { HamburgerMenu } from "./hamburger-menu";

export const NAV_LINKS = [
  { href: "/words", label: "造語一覧" },
  { href: "/hall-of-fame", label: "殿堂入り" },
  { href: "/about", label: "使い方" },
];

export function Navbar() {
  const pathname = usePathname();
  const { openSubmission } = useSubmission();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 items-center gap-3 px-4">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight"
        >
          DicTopia
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="メインナビゲーション"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 検索は成長の主要導線なので、モバイルでもメニューに隠さず常時表示する */}
        <div className="min-w-0 flex-1 sm:px-2">
          <SearchBar className="mx-auto max-w-md" />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            className="h-10 px-3"
            onClick={() => openSubmission()}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">新語を追加</span>
            <span className="sr-only sm:hidden">新語を追加</span>
          </Button>
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}
