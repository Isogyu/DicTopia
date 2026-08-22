# DicTopia Implementation State

## 現在のIssue
Issue 6-1: HTTPS/HSTS 対応

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
- `next.config.mjs` に `Strict-Transport-Security` ヘッダを追加
- `components/word/share-button.tsx` の http フォールバックを削除
- `app/word/[id]/page.tsx` の http フォールバックを削除
- `.env.local.example` に本番 `https://` 設定のコメントを追加
- `npx tsc --noEmit` 成功
- `npm run build` 成功
- `npx next start` 後の `curl -I` で HSTS ヘッダーを確認

## 直近の失敗と原因
- なし

## 備考
- Vercel ドメイン設定の変更はスコープ外。本番 URL 生成は `NEXT_PUBLIC_SITE_URL` に依存する。
