"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { VoteResponse, VoteStatusResponse } from "@/types/api";

type VoteStatus = "idle" | "voting" | "voted" | "limited";

interface VoteButtonProps {
  wordId: string;
  initialCount: number;
  onSuccess?: (newCount: number) => void;
}

export function VoteButton({ wordId, initialCount, onSuccess }: VoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [status, setStatus] = useState<VoteStatus>("idle");

  useEffect(() => {
    const checkVote = async () => {
      try {
        const res = await fetch(`/api/words/${wordId}/vote`);
        const result = (await res.json()) as VoteStatusResponse;
        if (res.ok && result.voted) {
          setCount(result.votes_count);
          setStatus("voted");
        }
      } catch {
        // 投票状態の取得に失敗しても操作は可能にする
      }
    };

    void checkVote();
  }, [wordId]);

  const handleVote = async () => {
    if (status === "voting" || status === "voted" || status === "limited") return;

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

  const disabled =
    status === "voting" || status === "voted" || status === "limited";
  const label = status === "voted" ? "投票済み" : "▲ 投票";

  return (
    <div className="flex flex-col gap-1">
      <div className="relative inline-flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleVote}
          disabled={disabled}
          aria-label="投票する"
        >
          {label} {count}
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
