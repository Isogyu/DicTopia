/**
 * サイト全体で共有するメタ情報。
 * OGP / sitemap / robots / シェア文言など、URL を必要とする箇所はすべてここを参照する。
 */

const FALLBACK_SITE_URL = "https://dic-topia11.vercel.app";

/**
 * 本番 URL。NEXT_PUBLIC_SITE_URL が未設定でも
 * Vercel が注入する VERCEL_URL、最終的に既知の本番ドメインへフォールバックする。
 * （未設定時にシェアボタンが無反応になる問題の再発防止）
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return FALLBACK_SITE_URL;
}

export const SITE_NAME = "DicTopia";

export const SITE_TAGLINE = "あなたの造語が、未来の辞書になる。";

export const SITE_DESCRIPTION =
  "DicTopia（ディクトピア）は、まだ辞書にない新しい言葉＝造語をみんなで投稿・投票して育てるコミュニティ辞典です。今の気持ちや現象にぴったりの言葉を、あなたの手で作りませんか。";

export const SITE_KEYWORDS = [
  "造語",
  "新語",
  "ネットスラング",
  "辞書",
  "流行語",
  "ミーム",
  "DicTopia",
  "ディクトピア",
];

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
