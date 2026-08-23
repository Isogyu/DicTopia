# DicTopia（ディクトピア）

UGC 造語・ミーム辞書プラットフォーム。ユーザーが新語を発明し、意味を定義し、週替わりのお題で投票・シェアできるサービスです。

## 公開 URL

本番環境は Vercel にデプロイされています。

- **アプリ**: https://dic-topia11.vercel.app
- **リポジトリ**: https://github.com/Isogyu/DicTopia

## 概要

DicTopia は、ユーザーが自分だけの新語（造語）を投稿し、他のユーザーからの投票やリアクションを通じて人気のある言葉を「殿堂入り」にできるプラットフォームです。

主な機能：

- 造語の投稿・表示
- お題に沿った週次コンテスト（機能フラグで無効化可能）
- 匿名投票（1 日 1 回制限）
- リアクション（絵文字）
- コメント
- 通報
- Hall of Fame
- OpenAI モデレーション（一時的にスキップ可能）
- 動的 OGP 画像生成
- 検索

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
- `SKIP_MODERATION`
- `NEXT_PUBLIC_ADMIN_EMAIL`

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

## 開発ルール

- 1 Issue = 1 feature branch = 1 PR
- PR は人間の承認を経てからマージする
- 進捗は `STATE.md` に記録する

## ライセンス

MIT
