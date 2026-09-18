"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { buildShareText, buildShareUrl, buildTweetIntent } from "@/lib/share";
import type { Word } from "@/types/database";

interface SubmissionSuccessProps {
  word: Word;
  onClose: () => void;
  onCreateAnother: () => void;
}

/**
 * 投稿完了画面。
 *
 * 従来はモーダルが黙って閉じるだけで、投稿 → 拡散の導線が切れていた。
 * UGC サービスの成長は「投稿直後のシェア率」でほぼ決まるため、
 * 熱量が最も高いこのタイミングでシェアと回遊を提示する。
 */
export function SubmissionSuccess({
  word,
  onClose,
  onCreateAnother,
}: SubmissionSuccessProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = buildShareUrl(word);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("リンクをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("コピーできませんでした", "error");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${word.word} - DicTopia`,
          text: buildShareText(word),
          url,
        });
        return true;
      } catch {
        // ユーザーがキャンセルした場合も含む。何もしない。
        return true;
      }
    }
    return false;
  };

  const handleShare = async () => {
    const handled = await handleNativeShare();
    if (!handled) {
      window.open(buildTweetIntent(word), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
        <p className="text-sm text-muted-foreground">あなたの造語</p>
        <p className="mt-1 break-words text-2xl font-bold">{word.word}</p>
        <p className="mt-2 text-sm text-muted-foreground">{word.definition}</p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        シェアすると、投票やコメントが集まりやすくなります。
      </p>

      <div className="space-y-2">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-base"
          onClick={handleShare}
        >
          X でシェアする
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 w-full text-base"
          onClick={handleCopy}
        >
          {copied ? "コピーしました" : "リンクをコピー"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          className="h-11 flex-1"
          onClick={() => {
            onClose();
            router.push(`/word/${word.id}`);
          }}
        >
          ページを見る
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 flex-1"
          onClick={onCreateAnother}
        >
          もう一つ作る
        </Button>
      </div>
    </div>
  );
}
