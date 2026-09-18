"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface QuickSubmitInputProps {
  onSubmit: (word: string) => void;
}

export function QuickSubmitInput({ onSubmit }: QuickSubmitInputProps) {
  const [word, setWord] = useState("");

  const handleSubmit = () => {
    const trimmed = word.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed.slice(0, 30));
    setWord("");
  };

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <label htmlFor="quick-word" className="sr-only">
        新しい造語
      </label>
      <input
        id="quick-word"
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value.slice(0, 30))}
        placeholder="新しい造語を入力（30文字以内）"
        className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" size="lg" className="h-12 shrink-0 px-6 text-base">
        投稿する
      </Button>
    </form>
  );
}
