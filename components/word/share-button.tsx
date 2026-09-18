"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { buildShareText, buildShareUrl, buildTweetIntent } from "@/lib/share";

interface ShareButtonProps {
  wordId: string;
  word: string;
  definition: string;
  /** 詳細ページなど、文言を出したい場所で true */
  withLabel?: boolean;
}

export function ShareButton({
  wordId,
  word,
  definition,
  withLabel = false,
}: ShareButtonProps) {
  const { toast } = useToast();
  const target = { id: wordId, word, definition };

  const handleShare = async () => {
    // モバイルではネイティブ共有シート、非対応環境では X の投稿画面へ
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${word} - DicTopia`,
          text: buildShareText(target),
          url: buildShareUrl(target),
        });
        return;
      } catch {
        // キャンセル時は何もしない
        return;
      }
    }

    const opened = window.open(
      buildTweetIntent(target),
      "_blank",
      "noopener,noreferrer"
    );

    if (!opened) {
      try {
        await navigator.clipboard.writeText(buildShareUrl(target));
        toast("リンクをコピーしました");
      } catch {
        toast("シェアできませんでした", "error");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`「${word}」をシェアする`}
      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      {withLabel && <span>シェア</span>}
    </button>
  );
}
