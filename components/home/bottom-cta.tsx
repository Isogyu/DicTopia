"use client";

import { Button } from "@/components/ui/button";

export function BottomCta() {
  return (
    <section className="bg-indigo-600 py-16 text-white">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-6 text-2xl font-bold sm:text-3xl">
          あなたの言葉が、未来の辞書に。
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => alert("新語追加は上部のボタンからお試しください")}
        >
          新語を追加する
        </Button>
      </div>
    </section>
  );
}
