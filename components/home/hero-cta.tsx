"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmission } from "@/components/submission/submission-provider";

/**
 * ヒーローの主 CTA。
 *
 * 「新語を追加する」を押してからモーダルで入力させるより、
 * その場で 1 語だけ入力させたほうが着手のハードルが下がるため、
 * 入力欄をそのまま置いてモーダルへ引き継ぐ。
 */
export function HeroCta() {
  const { openSubmission } = useSubmission();
  const [word, setWord] = useState("");

  const start = () => {
    openSubmission(word.trim().slice(0, 30));
    setWord("");
  };

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <label htmlFor="hero-word" className="sr-only">
        思いついた造語
      </label>
      <input
        id="hero-word"
        type="text"
        value={word}
        maxLength={30}
        onChange={(e) => setWord(e.target.value.slice(0, 30))}
        placeholder="思いついた言葉を入力（例：タイパ疲れ）"
        className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" size="lg" className="h-12 shrink-0 px-6 text-base">
        造語をつくる
      </Button>
    </form>
  );
}
