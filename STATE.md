# DicTopia Implementation State

## 現在のIssue
Issue 6-3: ホーム画面: HeroTopicCard 実装

## Phase 6 バックログ
- [x] Issue 6-1: HTTPS/HSTS 対応
- [ ] Issue 6-2: ホーム画面: Leaderboard/NewestList 分離・拡張
- [ ] Issue 6-3: ホーム画面: HeroTopicCard 実装
- [ ] Issue 6-4: POST /api/words 実装
- [ ] Issue 6-5: SubmissionModal 実装（Navbar + HeroTopicCard クイック投稿欄連携）
- [ ] Issue 6-6: Phase 6 結合確認・E2E 実行

## 過去の完了Issue
- [x] Phase 1: 基盤・DBセットアップ（Issue 1-1〜1-3）
- [x] Phase 2: コアAPIルート・モデレーション（Issue 2-1〜2-4）
- [x] Phase 3: 動的Edge OGP（Issue 3-1）
- [x] Issue 4-1: 共通レイアウト・Navbar・ダークテーマ
- [x] Issue 4-2: ホームページ
- [x] Issue 4-3: SubmissionModal
- [x] Issue 4-4: WordCard関連
- [x] Issue 4-5: `/word/[id]` 造語個別ページ
- [x] Issue 4-6: Hall of Fame
- [x] Issue 5-1: Seed データ
- [x] Issue 5-2: 統合テスト
- [x] Issue 5-3: E2Eテスト
- [x] Issue 5-4: 最終 DoD 確認

## 進行中Issueの状況
- `lib/week.ts` を新規追加（JST 基準の `week_code` 算出、日曜 23:59 までのカウントダウン）
- `components/home/countdown-timer.tsx` を新規追加
- `components/home/quick-submit-input.tsx` を新規追加
- `components/home/hero-topic-card.tsx` を client 化し、CountdownTimer / QuickSubmitInput / SubmissionModal を統合
- `components/submission/submission-modal.tsx` に `initialWord` プロパティを追加
- `npx tsc --noEmit` 成功
- `npm run build` 成功

## 備考
- Phase 6 は v1.1 追加ファイル群に基づくブラッシュアップ
