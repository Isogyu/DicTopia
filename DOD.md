# DicTopia Definition of Done

最終更新: 2026-08-22

## 実装完了項目

| フェーズ | 項目 | 状態 |
|---|---|---|
| Phase 1 | Next.js App Router（TypeScript / Tailwind CSS / shadcn/ui）初期化 | ✅ |
| Phase 1 | Supabase ローカル環境 + `0001_init.sql` マイグレーション | ✅ |
| Phase 2 | `POST /api/words`（バリデーション / OpenAI モデレーション / SEO エンリッチメント） | ✅ |
| Phase 2 | `POST /api/words/[id]/vote`（同日重複防止 / 楽観的更新） | ✅ |
| Phase 2 | `POST /api/words/[id]/react` | ✅ |
| Phase 2 | `POST /api/words/[id]/report`（3 件で自動非公開） | ✅ |
| Phase 3 | `GET /api/og/word/[id]`（Edge Runtime 動的 OGP 画像） | ✅ |
| Phase 4 | `/` ホームページ（HeroTopicCard / Leaderboard / NewestList） | ✅ |
| Phase 4 | `/word/[id]` 個別ページ（メタデータ / JSON-LD / OGP） | ✅ |
| Phase 4 | `/hall-of-fame` 殿堂入りページ | ✅ |
| Phase 4 | 共通レイアウト / Navbar / ダークテーマ | ✅ |
| Phase 5 | シードデータ（お題 2 件 / 造語 20 件） | ✅ |
| Phase 5 | 結合テスト（Vitest + MSW） | ✅ |
| Phase 5 | E2E テスト（Playwright / E2E-1, 2, 4, 9 相当） | ✅ |
| Phase 6 | HTTPS/HSTS 対応（`next.config.mjs` / 絶対URL `https://` 統一） | ✅ |
| Phase 6 | ホーム画面 2 カラムレイアウト（Leaderboard / NewestList 分離） | ✅ |
| Phase 6 | HeroTopicCard（カウントダウンタイマー / クイック投稿欄） | ✅ |
| Phase 6 | `POST /api/words` 結合テスト 7 ケース | ✅ |
| Phase 6 | SubmissionModal（Navbar + HeroTopicCard 連携 / `router.refresh`） | ✅ |

## 検証結果

```text
npx tsc --noEmit        → success
npm run build           → success
npx vitest run          → success
npm run e2e             → success
npx supabase db reset   → success
```

## 備考

- すべての Phase / Issue が PR 作成・マージ済。
- 未解決の既知問題は **STATE.md** に記載していない = なし。
