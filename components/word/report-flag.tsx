"use client";

import { Button } from "@/components/ui/button";
import type { ReportResponse } from "@/types/api";

interface ReportFlagProps {
  wordId: string;
  word: string;
}

export function ReportFlag({ wordId, word }: ReportFlagProps) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleReport = async () => {
    const reason = window.prompt("通報の理由を入力してください（任意）");
    if (reason === null) return;

    try {
      const res = await fetch(`/api/words/${wordId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      const result = (await res.json()) as ReportResponse;

      if (res.ok && result.success) {
        const subject = encodeURIComponent(`[DicTopia 通報] ${word}`);
        const body = encodeURIComponent(
          `通報対象: ${word}\nURL: ${window.location.origin}/word/${wordId}\n理由: ${reason || "理由なし"}\n\n運営へ連絡してください。`
        );

        if (adminEmail) {
          window.open(
            `mailto:${adminEmail}?subject=${subject}&body=${body}`,
            "_blank"
          );
        }

        alert(
          result.auto_unpublished
            ? "通報を受け付けました。非公開にしました。"
            : "通報を受け付けました。"
        );
        return;
      }

      alert("error" in result ? result.error : "通報に失敗しました");
    } catch {
      alert("通報に失敗しました");
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleReport}
      aria-label="通報する"
    >
      🚩 通報
    </Button>
  );
}
