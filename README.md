# DicTopia（ディクトピア）

UGC造語・ミーム辞書プラットフォーム。ユーザーが新語を発明し、意味を定義し、週替わりのお題で投票・シェアできるサービス。

## ドキュメント

実装は以下のドキュメントに従って進めています。

- `DicTopia_Devin実行プロンプト_ループエンジニアリング版.md` — 開発の進め方（Phase/Issue/Loop、Human Gate運用）を定義する最上位の指示書。最初に読むこと。
- `DicTopia_仕様書.md` — 機能要件・DB論理設計・API一覧
- `DicTopia_詳細設計書.md` — ディレクトリ構成・型定義・シーケンス設計・エラー方針
- `DicTopia_テスト計画書.md` — 単体/結合/E2Eテスト方針
- `DicTopia_Supabaseセットアップ手順書.md` — Supabaseのセットアップ手順（マイグレーションSQLの正典）

## 開発ルール

- 1 Issue = 1 feature branch = 1 PR
- PRは人間の承認を経てからマージする（AIによる自己判断でのマージは行わない）
- 進捗は `STATE.md` に記録する

## 技術スタック

Next.js 14+ (App Router, TypeScript) / Tailwind CSS + shadcn/ui / Supabase (PostgreSQL, RLS) / OpenAI API / Vercel