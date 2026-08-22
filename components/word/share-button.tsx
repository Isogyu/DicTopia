"use client";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  wordId: string;
  word: string;
}

export function ShareButton({ wordId, word }: ShareButtonProps) {
  const handleShare = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) return;

    const url = `${siteUrl}/word/${wordId}`;
    const text = `${word} - DicTopia で作語をシェア`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}&hashtags=DicTopia`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleShare}
      aria-label="Xでシェア"
    >
      X でシェア
    </Button>
  );
}
