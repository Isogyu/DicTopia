# DicTopia Implementation State

## 現在のIssue
Issue 5-2: 統合テスト

## 完了Issue
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

## 進行中Issueの状況
- Vitest + MSW のテスト環境を構築
  - `vitest` / `msw` / `dotenv` / `@types/node` を DevDependencies に追加
  - `vitest.config.ts` を追加（`.env.local` 読み込み、`@/` エイリアス）
  - `package.json` に `test: "vitest run"` を追加
- `__tests__/api/words.test.ts` を追加
  - 正常投稿（201）
  - 30 文字超過（400）
  - モデレーション拒否（422）
- `supabase/migrations/0001_init.sql` に `service_role` 向け権限付与を追加
  - `words/votes/reactions/reports/topics` のテーブル権限
  - RPC 関数の EXECUTE 権限
- `npx supabase db reset` 成功
- `npx tsc --noEmit` / `npm run build` / `npx vitest run` 全て成功

## 直近の失敗と原因
- Vitest テストで `POST /api/words` が 500 を返していた
  - `service_role` からの `words` テーブル `INSERT` 権限がなかった
  - `supabase/migrations/0001_init.sql` に `GRANT` 文を追加して解決

## 次回の着手事項
- PR 作成後、人間の承認を待つ
- Issue 5-3（E2Eテスト）に進む
