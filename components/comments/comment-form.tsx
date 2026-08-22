"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CreateCommentResponse } from "@/types/api";

interface CommentFormProps {
  wordId: string;
}

export function CommentForm({ wordId }: CommentFormProps) {
  const router = useRouter();
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
        body: JSON.stringify({ body: body.trim(), nickname: nickname.trim() || undefined }),
      });

      const result = (await res.json()) as CreateCommentResponse;

      if (res.ok && result.success) {
        setBody("");
        setNickname("");
        router.refresh();
        return;
      }

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    } catch {
      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div>
        <label htmlFor="comment-nickname" className="mb-1 block text-sm font-medium">
          ニックネーム（任意）
        </label>
        <input
          id="comment-nickname"
          type="text"
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 30))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="名無し"
        />
      </div>
      <div>
        <label htmlFor="comment-body" className="mb-1 block text-sm font-medium">
          コメント
        </label>
        <textarea
          id="comment-body"
          rows={4}
          maxLength={200}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 200))}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="この造語への感想を書いてください"
          required
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {body.length} / 200
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "投稿中..." : "コメントを投稿する"}
      </Button>
    </form>
  );
}
