"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { CreateCommentResponse } from "@/types/api";

interface CommentFormProps {
  wordId: string;
}

export function CommentForm({ wordId }: CommentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length === 0) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/words/${wordId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          nickname: nickname.trim() || undefined,
        }),
      });

      const result = (await res.json()) as CreateCommentResponse;

      if (res.ok && result.success) {
        setBody("");
        toast("コメントを投稿しました");
        router.refresh();
        return;
      }

      if (res.status === 429) {
        setServerError(
          "短時間にコメントしすぎています。少し時間をおいてお試しください"
        );
        return;
      }

      setServerError(
        !result.success && result.error
          ? result.error
          : "投稿に失敗しました。時間をおいて再度お試しください"
      );
    } catch {
      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-semibold">この造語にコメントする</p>

      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </p>
      )}

      <div>
        <label htmlFor="comment-body" className="sr-only">
          コメント
        </label>
        <textarea
          id="comment-body"
          rows={3}
          maxLength={200}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 200))}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="この造語への感想を書いてください"
          required
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {body.length} / 200
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="comment-nickname" className="sr-only">
            ニックネーム（任意）
          </label>
          <input
            id="comment-nickname"
            type="text"
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 30))}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="ニックネーム（任意）"
            autoComplete="nickname"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 shrink-0 px-6"
          disabled={isSubmitting || body.trim().length === 0}
        >
          {isSubmitting ? "投稿中..." : "投稿する"}
        </Button>
      </div>
    </form>
  );
}
