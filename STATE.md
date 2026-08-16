# DicTopia Implementation State

## 現在のIssue
Issue 5-3: E2Eテスト

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
- [x] Issue 5-3: E2Eテスト

## 進行中Issueの状況
- Playwright E2E 環境を構築
  - `@playwright/test` を DevDependencies に追加
  - `playwright.config.ts` を追加（`npm run dev` を webServer として起動）
  - `package.json` に `e2e: playwright test` を追加
  - `.gitignore` に `test-results` / `playwright-report` を追加
- `e2e/home.spec.ts` `e2e/word.spec.ts` `e2e/hall-of-fame.spec.ts` を追加
  - ホーム表示・個別ページ遷移・JSON-LD・殿堂入り週表示
- `supabase/migrations/0001_init.sql` に `anon` / `authenticated` 向け権限を追加
  - `USAGE` on schema
  - `SELECT` on `words` / `topics`
  - `INSERT` on `words` / `votes` / `reactions` / `reports`
- `npx supabase db reset` 成功
- `npx tsc --noEmit` / `npm run build` / `npx vitest run` / `npm run e2e` 全て成功

## 直近の失敗と原因
- E2E テストでホームページに造語が表示されず、個別ページ・殿堂入りも失敗
  - `anon` ロールに `words` / `topics` の `SELECT` 権限がなかった
  - `supabase/migrations/0001_init.sql` に `GRANT` 文を追加して解決

## 次回の着手事項
- PR 作成後、人間の承認を待つ
- Issue 5-4（最終 DoD 確認）に進む
