"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { SubmissionModal } from "@/components/submission/submission-modal";
import { SearchBar } from "./search-bar";
import { LoginButton } from "./login-button";
import { HamburgerMenu } from "./hamburger-menu";
import type { Topic } from "@/types/database";

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("topics")
      .select("*")
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setActiveTopic(data as Topic);
        }
      });
  }, []);

  const handleSubmitted = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <a href="/" className="text-xl font-bold tracking-tight">
            DicTopia
          </a>
          <div className="hidden flex-1 px-4 sm:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              aria-label="造語を作る"
            >
              新語を追加
            </Button>
            <LoginButton />
            <HamburgerMenu />
          </div>
        </div>
      </header>
      <SubmissionModal
        activeTopic={activeTopic}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}
