"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { EmojiType } from "@/types/database";
import type { ReactResponse } from "@/types/api";

const EMOJI: { type: EmojiType; char: string; label: string }[] = [
  { type: "fire", char: "🔥", label: "熱い" },
  { type: "laugh", char: "😂", label: "笑える" },
  { type: "cry", char: "😢", label: "泣ける" },
  { type: "clap", char: "👏", label: "うまい" },
];

const STORAGE_KEY = "dictopia:reactions";

/** 自分がどの造語にどの絵文字で反応したかを端末に覚えておく */
function loadReacted(wordId: string): EmojiType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, EmojiType[]>;
    return parsed[wordId] ?? [];
  } catch {
    return [];
  }
}

function saveReacted(wordId: string, emojis: EmojiType[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, EmojiType[]>) : {};
    parsed[wordId] = emojis;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ストレージが使えなくてもリアクション自体は送信できる
  }
}

interface ReactionBarProps {
  wordId: string;
  onReacted?: () => void;
}

export function ReactionBar({ wordId, onReacted }: ReactionBarProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<EmojiType | null>(null);
  const [reacted, setReacted] = useState<EmojiType[]>([]);

  useEffect(() => {
    setReacted(loadReacted(wordId));
  }, [wordId]);

  const handleReact = async (emoji: EmojiType) => {
    // 従来は 1 度反応すると 4 種すべてが押せなくなり、
    // リロードすれば無制限に押せてしまっていた。
    // 絵文字ごとに 1 回だけ、かつリロード後も保持する。
    if (submitting || reacted.includes(emoji)) return;

    setSubmitting(emoji);

    try {
      const res = await fetch(`/api/words/${wordId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji_type: emoji }),
      });
      const result = (await res.json()) as ReactResponse;

      if (res.ok && result.success) {
        const next = [...reacted, emoji];
        setReacted(next);
        saveReacted(wordId, next);
        onReacted?.();
        return;
      }

      if (res.status === 409) {
        // サーバー側で重複と判定された場合も、押下済みとして扱う
        const next = [...reacted, emoji];
        setReacted(next);
        saveReacted(wordId, next);
        return;
      }

      toast(
        res.status === 429
          ? "操作が速すぎます。少し時間をおいてください"
          : "リアクションに失敗しました",
        "error"
      );
    } catch {
      toast("リアクションに失敗しました", "error");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="リアクション">
      {EMOJI.map(({ type, char, label }) => {
        const active = reacted.includes(type);
        return (
          <button
            key={type}
            type="button"
            disabled={submitting === type || active}
            onClick={() => handleReact(type)}
            aria-label={`${label}（${char}）のリアクションを送る`}
            aria-pressed={active}
            title={label}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-accent ring-1 ring-primary/40"
                : "hover:bg-muted disabled:opacity-60"
            )}
          >
            <span aria-hidden="true">{char}</span>
          </button>
        );
      })}
    </div>
  );
}
