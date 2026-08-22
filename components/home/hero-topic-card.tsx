"use client";

import { useState } from "react";
import { CountdownTimer } from "./countdown-timer";
import { QuickSubmitInput } from "./quick-submit-input";
import { SubmissionModal } from "@/components/submission/submission-modal";
import { getCurrentWeekCode } from "@/lib/week";
import type { Topic } from "@/types/database";

interface HeroTopicCardProps {
  topic: Topic | null;
}

export function HeroTopicCard({ topic }: HeroTopicCardProps) {
  const [open, setOpen] = useState(false);
  const [quickWord, setQuickWord] = useState("");

  const handleQuickSubmit = (word: string) => {
    setQuickWord(word);
    setOpen(true);
  };

  return (
    <section className="w-full border-b border-border/40 bg-muted/40 py-12">
      <div className="container mx-auto px-4">
        {topic ? (
          <div className="max-w-2xl space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                今週のお題 ({getCurrentWeekCode()})
              </p>
              <h1 className="mb-3 text-2xl font-bold md:text-3xl">
                {topic.title}
              </h1>
              {topic.description && (
                <p className="text-muted-foreground">{topic.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">このお題で造語を作る</p>
              <QuickSubmitInput onSubmit={handleQuickSubmit} />
            </div>

            <CountdownTimer />
          </div>
        ) : (
          <div className="max-w-2xl">
            <h1 className="mb-3 text-2xl font-bold md:text-3xl">
              今週のお題はまだありません
            </h1>
            <p className="text-muted-foreground">
              新しいお題が決まるのをお待ちください。
            </p>
          </div>
        )}
      </div>

      <SubmissionModal
        activeTopic={topic}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={() => setOpen(false)}
        initialWord={quickWord}
      />
    </section>
  );
}
