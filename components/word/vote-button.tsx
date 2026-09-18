"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoteStatus } from "./vote-status-provider";
import type { VoteResponse } from "@/types/api";

type VoteStatus = "idle" | "voting" | "voted" | "limited";

interface VoteButtonProps {
  wordId: string;
  initialCount: number;
  onSuccess?: (newCount: number) => void;
}

export function VoteButton({
  wordId,
  initialCount,
  onSuccess,
}: VoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [status, setStatus] = useState<VoteStatus>("idle");
  const { voted, markVoted } = useVoteStatus(wordId);

  useEffect(() => {
    if (voted) setStatus("voted");
  }, [voted]);

  const handleVote = async () => {
    if (status !== "idle") return;

    // 楽観的更新：押した瞬間に反映し、失敗時に戻す
    const previous = count;
    setStatus("voting");
    setCount((c) => c + 1);

    try {
      const res = await fetch(`/api/words/${wordId}/vote`, { method: "POST" });
      const result = (await res.json()) as VoteResponse;

      if (res.ok && result.success) {
        setCount(result.votes_count);
        setStatus("voted");
        markVoted();
        onSuccess?.(result.votes_count);
        return;
      }

      setCount(previous);
      setStatus(res.status === 429 ? "limited" : "idle");
    } catch {
      setCount(previous);
      setStatus("idle");
    }
  };

  const isDone = status === "voted" || status === "limited";

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={status !== "idle"}
      aria-pressed={isDone}
      aria-label={
        isDone ? `投票済み（現在 ${count} 票）` : `投票する（現在 ${count} 票）`
      }
      title={status === "limited" ? "本日はこの造語に投票済みです" : undefined}
      className={cn(
        // モバイルのタップ領域として最低 44px の高さを確保する
        "inline-flex h-11 min-w-[72px] items-center justify-center gap-1 rounded-full border px-3 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDone
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
        status === "voting" && "opacity-70"
      )}
    >
      <ChevronUp className="h-4 w-4" aria-hidden="true" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
