"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { ReportResponse } from "@/types/api";

interface ReportFlagProps {
  wordId: string;
  word: string;
}

const REASONS = ["スパム", "暴言", "不適切", "その他"];

export function ReportFlag({ wordId, word }: ReportFlagProps) {
  const { toast } = useToast();
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
        setReason(null);
        setComment("");
        // 通報内容は DB に記録され、運営側で確認する。
        // 以前はここで mailto: を開いていたが、
        // ポップアップブロックで失敗しやすく、
        // 管理者メールアドレスをクライアントに露出させていたため廃止した。
        toast("通報を受け付けました。ご協力ありがとうございます");
        return;
      }

      if (res.status === 429) {
        setError("短時間に通報しすぎています。時間をおいてお試しください");
        return;
      }

      setError(
        "error" in result && result.error ? result.error : "通報に失敗しました"
      );
    } catch {
      setError("通報に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`「${word}」を通報する`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="通報する"
        titleId="report-title"
        className="max-w-md"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          「{word}」を通報する理由を選択してください。
        </p>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-1">
            <legend className="mb-1 text-sm font-medium">通報理由</legend>
            {REASONS.map((r) => (
              <label
                key={r}
                className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted"
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
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="h-11 flex-1"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-11 flex-1"
              disabled={submitting}
            >
              {submitting ? "送信中..." : "通報する"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
