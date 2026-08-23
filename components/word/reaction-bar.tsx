"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EmojiType } from "@/types/database";
import type { ReactResponse } from "@/types/api";

const EMOJI_MAP: Record<EmojiType, string> = {
  fire: "🔥",
  laugh: "😂",
  cry: "😢",
  clap: "👏",
};

interface ReactionBarProps {
  wordId: string;
  onReacted?: () => void;
}

export function ReactionBar({ wordId, onReacted }: ReactionBarProps) {
  const [submitting, setSubmitting] = useState<EmojiType | null>(null);
  const [reacted, setReacted] = useState<EmojiType | null>(null);

  const handleReact = async (emoji: EmojiType) => {
    if (submitting || reacted === emoji) return;

    setSubmitting(emoji);

    try {
      const res = await fetch(`/api/words/${wordId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji_type: emoji }),
      });
      const result = (await res.json()) as ReactResponse;

      if (res.ok && result.success) {
        setReacted(emoji);
        onReacted?.();
        return;
      }

      if (!res.ok) {
        alert("error" in result ? result.error : "リアクションに失敗しました");
      }
    } catch {
      alert("リアクションに失敗しました");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex items-center gap-2" aria-label="リアクション">
      {(Object.keys(EMOJI_MAP) as EmojiType[]).map((emoji) => (
        <Button
          key={emoji}
          type="button"
          size="icon"
          variant={reacted === emoji ? "default" : "ghost"}
          className="text-xl"
          disabled={submitting === emoji || Boolean(reacted)}
          onClick={() => handleReact(emoji)}
          aria-label={emoji}
          title={emoji}
        >
          {EMOJI_MAP[emoji]}
        </Button>
      ))}
    </div>
  );
}
