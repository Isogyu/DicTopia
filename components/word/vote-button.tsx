"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { VoteResponse } from "@/types/api";

type VoteStatus = "idle" | "voting" | "voted" | "limited";

interface VoteButtonProps {
  wordId: string;
  initialCount: number;
  onSuccess?: (newCount: number) => void;
}

export function VoteButton({ wordId, initialCount, onSuccess }: VoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [status, setStatus] = useState<VoteStatus>("idle");

  const handleVote = async () => {
    if (status === "voting" || status === "limited") return;

    setStatus("voting");

    try {
      const res = await fetch(`/api/words/${wordId}/vote`, { method: "POST" });
      const result = (await res.json()) as VoteResponse;

      if (res.ok && result.success) {
        setCount(result.votes_count);
        setStatus("voted");
        onSuccess?.(result.votes_count);
        return;
      }

      if (res.status === 429) {
        setStatus("limited");
        return;
      }

      setStatus("idle");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative inline-flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleVote}
          disabled={status === "voting" || status === "limited"}
          aria-label="投票する"
        >
          ▲ 投票 {count}
        </Button>
      </div>
      {status === "limited" && (
        <p className="text-xs text-destructive">
          本日はこの造語にすでに投票済みです
        </p>
      )}
    </div>
  );
}
