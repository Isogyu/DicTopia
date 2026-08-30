"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReportResponse } from "@/types/api";

interface ReportFlagProps {
  wordId: string;
  word: string;
}

const REASONS = ["スパム", "暴言", "不適切", "その他"];

export function ReportFlag({ wordId, word }: ReportFlagProps) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("通報理由を選択してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: { reason: string; comment?: string } = { reason };
    if (reason === "その他" && comment.trim()) {
      payload.comment = comment.trim();
    }

    try {
      const res = await fetch(`/api/words/${wordId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ReportResponse;

      if (res.ok && result.success) {
        setOpen(false);

        const subject = encodeURIComponent(`[DicTopia 通報] ${word}`);
        const body = encodeURIComponent(
          `通報対象: ${word}\nURL: ${window.location.origin}/word/${wordId}\n理由: ${reason}\nコメント: ${comment || "なし"}\n\n運営へ連絡してください。`
        );

        if (adminEmail) {
          window.open(
            `mailto:${adminEmail}?subject=${subject}&body=${body}`,
            "_blank"
          );
        }
        return;
      }

      setError("error" in result ? result.error : "通報に失敗しました");
    } catch {
      setError("通報に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="通報する"
      >
        🚩 通報
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm sm:items-center sm:pt-0"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="report-title" className="text-xl font-bold">
                通報
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-2xl text-muted-foreground hover:text-foreground"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              「{word}」を通報する理由を選択してください。
            </p>

            {error && (
              <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">通報理由</legend>
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="h-4 w-4"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </fieldset>

              {reason === "その他" && (
                <div>
                  <label
                    htmlFor="report-comment"
                    className="mb-1 block text-sm font-medium"
                  >
                    詳細（任意）
                  </label>
                  <textarea
                    id="report-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="具体的な内容を入力してください"
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {comment.length} / 500
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "送信中..." : "通報する"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
