"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface QuickSubmitInputProps {
  onSubmit: (word: string) => void;
}

export function QuickSubmitInput({ onSubmit }: QuickSubmitInputProps) {
  const [word, setWord] = useState("");

  const handleSubmit = () => {
    if (word.trim().length === 0) return;
    onSubmit(word.trim().slice(0, 30));
    setWord("");
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value.slice(0, 30))}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder="新しい造語を入力（30文字以内）"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="button" onClick={handleSubmit} aria-label="投稿する">
        投稿
      </Button>
    </div>
  );
}
