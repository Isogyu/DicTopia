import { absoluteUrl } from "./site";

export interface ShareTarget {
  id: string;
  word: string;
  definition: string;
}

/** X に流したときにタイムラインで「意味が伝わる」本文を組み立てる */
export function buildShareText({ word, definition }: ShareTarget): string {
  // X の本文は URL・ハッシュタグと合わせて読みやすい長さに抑える
  const trimmed =
    definition.length > 60 ? `${definition.slice(0, 59)}…` : definition;
  return `【${word}】${trimmed}\n\n#DicTopia で見つけた造語`;
}

export function buildShareUrl(target: ShareTarget): string {
  return absoluteUrl(`/word/${target.id}`);
}

export function buildTweetIntent(target: ShareTarget): string {
  const params = new URLSearchParams({
    text: buildShareText(target),
    url: buildShareUrl(target),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
