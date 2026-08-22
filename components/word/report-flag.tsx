"use client";

import { Button } from "@/components/ui/button";
import type { ReportResponse } from "@/types/api";

interface ReportFlagProps {
  wordId: string;
}

export function ReportFlag({ wordId }: ReportFlagProps) {
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
