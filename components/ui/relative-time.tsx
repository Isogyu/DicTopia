"use client";

import { useEffect, useState } from "react";
import { toRelativeTime } from "@/lib/relative-time";

/**
 * 相対時刻表示。
 *
 * サーバーとクライアントで `Date.now()` がずれるとハイドレーション不一致になるため、
 * 初期描画は絶対日付、マウント後に相対表記へ切り替える。
 * `<time datetime>` にすることで検索エンジンと支援技術にも正しい日付が伝わる。
 */
export function RelativeTime({ value }: { value: string }) {
  const date = new Date(value);
  const absolute = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(date);

  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    setLabel(toRelativeTime(value));
  }, [value]);

  return (
    <time dateTime={date.toISOString()} title={absolute}>
      {label}
    </time>
  );
}
