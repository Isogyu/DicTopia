# DicTopia（ディクトピア）

UGC 造語・ミーム辞書プラットフォーム。ユーザーが新語を発明し、意味を定義し、週替わりのお題で投票・シェアできるサービスです。

## 公開 URL

本番環境は Vercel にデプロイされています。

- **アプリ**: https://dic-topia11.vercel.app
- **リポジトリ**: https://github.com/Isogyu/DicTopia

## 概要

DicTopia は、ユーザーが自分だけの新語（造語）を投稿し、他のユーザーからの投票やリアクションを通じて人気のある言葉を「殿堂入り」にできるプラットフォームです。

主な機能：

- 造語の投稿・表示（ログイン不要）
- 造語一覧 `/words` とカテゴリ別一覧 `/words/[category]`（新着順 / 人気順・ページング）
- 検索（ヘッダーのサジェスト + 検索結果ページ `/search`）
- 匿名投票（1 日 1 回制限）
- リアクション（絵文字・同日同絵文字は 1 回）
- コメント
- 通報（3 件で自動非公開）
- 殿堂入り `/hall-of-fame`
- 使い方・ガイドライン `/about`
- お題に沿った週次コンテスト（機能フラグで無効化可能）
- OpenAI モデレーション
- 動的 OGP 画像生成（造語ごと / サイト共通）
- SEO 基盤：`sitemap.xml`・`robots.txt`・構造化データ（WebSite / DefinedTerm / BreadcrumbList / FAQPage）
- 書き込み系 API のレートリミット

## 開発アプローチ

本プロジェクトは、企画からテストまで **ループエンジニアリングに基づく AI 駆動開発** で構築されています。

### プロセス

1. **企画・設計**: `Devin指示書/` に仕様書・詳細設計書・テスト計画書を整備し、機能要件と設計を明確化
2. **フェーズ分け**: Phase 1 から Phase 7 まで段階的に機能を追加・改善
3. **AI による実装**: Devin が設計書に基づいてコードを生成し、各機能を Issue ブランチで実装
4. **レビュー・承認**: 各機能は 1 Issue = 1 feature branch = 1 PR の形で人間の承認を経てマージ
5. **テスト駆動**: Vitest / Playwright / TypeScript 型チェック / `npm run build` を用いて継続的に検証
6. **継続的な改善**: エラーや UX フィードバックを受け、小さなサイクルで修正・リファインを繰り返す

### 文書化された知識

- 仕様、設計、テスト計画、実行プロンプトをリポジトリ内に保持
- 開発の判断基準を明文化し、再現性と保守性を向上

## 技術スタック

- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, RLS)
- OpenAI API
- Vercel
- Vitest + Playwright

## 開発環境のセットアップ

### 前提条件

- Node.js (推奨: 18 以上)
- pnpm / npm
- Docker Desktop（Supabase ローカル開発用）

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` としてコピーし、値を設定します。

```bash
cp .env.local.example .env.local
```

主な変数：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FEATURE_WEEKLY_TOPIC`
- `SKIP_MODERATION`（本番では必ず `false`。`true` にすると投稿が無検査で公開されます）
- `DISABLE_RATE_LIMIT`（ローカル検証用。本番では設定しないでください）

> `NEXT_PUBLIC_ADMIN_EMAIL` は廃止しました。通報はサーバー側の `reports` テーブルに記録されます。

### 3. ローカル Supabase の起動

```bash
npx supabase start
```

Studio: http://127.0.0.1:54323

### 4. マイグレーションとシードデータの適用

```bash
npx supabase db reset
```

もしくは：

```bash
npx supabase db push
npx supabase db query --file supabase/seed.sql
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## テスト

### 単体・結合テスト

```bash
npm run test
```

### E2E テスト

```bash
npm run e2e
```

### ビルド確認

```bash
npm run build
```

## デプロイ

本番は Vercel への Git 連携デプロイを想定しています。

1. `main` ブランチを Vercel プロジェクトに連携
2. 本番用の Supabase プロジェクトを用意
3. Vercel の **Environment Variables** に本番用の値を設定
4. クラウド Supabase へマイグレーション・シードデータを適用
5. `git push origin main` で自動デプロイ

本番環境用の `NEXT_PUBLIC_SUPABASE_URL` などは、ローカルと異なる値にしてください。

## ドキュメント

実装は `Devin指示書/` 内のドキュメントに従って進めています。

- `DicTopia_Devin実行プロンプト_ループエンジニアリング版.md` — 開発進め方
- `DicTopia_仕様書.md` — 機能要件・DB 設計・API 一覧
- `DicTopia_詳細設計書.md` — ディレクトリ構成・型定義・シーケンス設計
- `DicTopia_テスト計画書.md` — 単体/結合/E2E テスト方針
- `DicTopia_Supabaseセットアップ手順書.md` — Supabase セットアップ手順

## アーキテクチャ上の約束ごと

- **読み取りは `lib/supabase/public.ts`（anon + RLS）**を使う。`lib/supabase/server.ts` は `cookies()` を参照するため、使った時点でそのページは動的レンダリングに落ちて ISR が効かなくなる。
- **Service Role（`lib/supabase/admin.ts`）は書き込み系 Route Handler 専用。** クライアントコンポーネントから絶対に import しない。
- **一覧・検索のクエリは `lib/words.ts` に集約する。** ページごとに `select` を書くと、カウントの取り方がずれる。
- **PostgREST の `or()` にユーザー入力を直接埋め込まない。** 必ず `lib/supabase/filters.ts` の `sanitizeSearchTerm` / `ilikeFilter` を通す（フィルタインジェクション対策）。
- **書き込み系 API には `lib/rate-limit.ts` を通す。** とくに OpenAI を呼ぶエンドポイントは課金に直結する。
- **カテゴリの定義は `lib/categories.ts` が唯一の情報源。** zod スキーマ・UI・URL スラッグはここから導出する。
- レートリミットは現状プロセス内メモリ。厳密な分散制御が必要になったら `lib/rate-limit.ts` の実装だけを Upstash Redis / Vercel KV に差し替える。

## 開発ルール

- 1 Issue = 1 feature branch = 1 PR
- PR は人間の承認を経てからマージする
- 進捗は `STATE.md` に記録する

## ライセンス

MIT
