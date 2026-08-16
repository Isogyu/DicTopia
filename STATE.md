# DicTopia Implementation State

## 現在のIssue
Issue 4-2: ホームページ（HeroTopicCard, Leaderboard, NewestList）

## 完了Issue
- [x] Phase 1: 基盤・DBセットアップ（Issue 1-1〜1-3）
- [x] Phase 2: コアAPIルート・モデレーション（Issue 2-1〜2-4）
- [x] Phase 3: 動的Edge OGP（Issue 3-1）
- [x] Issue 4-1: 共通レイアウト・Navbar・ダークテーマ
- [x] Issue 4-2: ホームページ

## 進行中Issueの状況
- `app/page.tsx` をサーバーコンポーネント化し、Supabase からお題・トップ10・新着を取得
- `components/home/hero-topic-card.tsx` `leaderboard.tsx` `newest-list.tsx` を作成
- `components/word/word-card.tsx` を作成（4-4 でも使用）
- `npx tsc --noEmit` 成功
- `npm run build` 成功

## 直近の失敗と原因
- なし

## 次回の着手事項
- PR 作成後、人間の承認を待つ
- Issue 4-3（SubmissionModal）に進む
