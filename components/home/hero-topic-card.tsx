"use client";

import { CountdownTimer } from "./countdown-timer";
import { QuickSubmitInput } from "./quick-submit-input";
import { useSubmission } from "@/components/submission/submission-provider";
import { getCurrentWeekCode } from "@/lib/week";
import type { Topic } from "@/types/database";

export function HeroTopicCard({ topic }: { topic: Topic | null }) {
  const { openSubmission } = useSubmission();

  return (
    <section className="w-full border-b border-border bg-gradient-to-br from-indigo-50 via-background to-violet-50 py-12">
      <div className="container mx-auto px-4">
        {topic ? (
          <div className="max-w-2xl space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-primary">
                今週のお題（{getCurrentWeekCode()}）
              </p>
              <h1 className="mb-3 text-2xl font-extrabold md:text-3xl">
                {topic.title}
              </h1>
              {topic.description && (
                <p className="text-muted-foreground">{topic.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">このお題で造語を作る</p>
              <QuickSubmitInput onSubmit={openSubmission} />
            </div>

            <CountdownTimer />
          </div>
        ) : (
          <div className="max-w-2xl">
            <h1 className="mb-3 text-2xl font-extrabold md:text-3xl">
              今週のお題はまだありません
            </h1>
            <p className="text-muted-foreground">
              新しいお題が決まるのをお待ちください。お題がなくても造語は投稿できます。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
