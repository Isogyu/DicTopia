"use client";

import { Button } from "@/components/ui/button";
import { useSubmission } from "@/components/submission/submission-provider";

export function BottomCta() {
  const { openSubmission } = useSubmission();

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-3 text-2xl font-bold sm:text-3xl">
          あなたの言葉が、未来の辞書に。
        </p>
        <p className="mb-6 text-sm text-primary-foreground/80">
          ログイン不要。思いついた言葉をそのまま登録できます。
        </p>
        <Button
          size="lg"
          className="h-12 bg-background px-8 text-base text-primary hover:bg-background/90"
          onClick={() => openSubmission()}
        >
          新語を追加する
        </Button>
      </div>
    </section>
  );
}
