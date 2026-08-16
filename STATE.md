# DicTopia Implementation State

## 現在のIssue
Issue 3-1: GET /api/og/word/[id]

## 完了Issue
- [x] Phase 1: 基盤・DBセットアップ（Issue 1-1〜1-3）
- [x] Phase 2: コアAPIルート・モデレーション（Issue 2-1〜2-4）
- [x] Issue 3-1: GET /api/og/word/[id]

## 進行中Issueの状況
- Edge Runtime OGP画像生成: 完了
- 1200x630 PNG / ダーク背景 / 太字タイポ
- 存在しない・非公開ID はフォールバック画像
- `Cache-Control: public, max-age=60, s-maxage=3600` 付与
- `npx tsc --noEmit` 成功
- `npm run build` 成功

## 直近の失敗と原因
- `@vercel/og` の `ImageResponse` フォント型と `String.matchAll` イテレータで TypeScript エラー
  → `FontData.style` から `oblique` を削除、フォントCSSは `RegExp#exec` でパース

## 次回の着手事項
- PR 作成後、人間の承認を待つ
- Phase 3 完了後、Phase 4（フロントエンド）に進む
