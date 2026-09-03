# Phase 1 Issue 1-1: 認証アーキテクチャの検討メモ

作成日: 2026-09-03

## 前提条件

- フロントエンド: Next.js 14+ App Router
- DB: Supabase (PostgreSQL + RLS)
- 既存スキーマ: `words`, `comments`, `votes`, `reports`, `reactions`, `topics`
- 既存 `words.user_id` / `comments.user_id` は `auth.users(id)`（Supabase Auth）を参照する受け皿列として追加済み
- 既存 RLS: 全テーブル SELECT/INSERT を匿名・認証ユーザーに開放（認証不要の UGC 設計）

## 方式比較

### 方式A：Firebase 認証 + service_role 経由のサーバーサイド書き込み（推奨・低コスト）

- **構成**
  - 認証のみ Firebase Authentication（メール/パスワード、Google）を使用
  - クライアントは Firebase ID トークンを取得
  - API Route / Server Action で `firebase-admin` SDK により ID トークンを検証
  - Supabase 書き込みは `service_role` キーを持つサーバーサイドクライアントで実施
- **Pros**
  - 既存 Supabase スキーマ・RLS への影響が最小
  - Firebase Auth のセットアップのみで、Supabase Auth との統合を気にしなくてよい
  - 既存の匿名投稿との互換性を保ちやすい（`user_id` が NULL の場合は「名無し」表示）
- **Cons**
  - RLS は緩めのままとなるため、アプリ層で認可を担保する必要がある
  - service_role キーがサーバー側で厳重に管理される必要がある（既に `createAdminClient` がある）

### 方式B：Supabase Third-Party Auth + Firebase 発行 JWT

- **構成**
  - Firebase を JWT 発行者として Supabase に登録
  - RLS で `auth.jwt()` から Firebase UID を取得しポリシーを書く
  - Supabase 側の機能対応状況や手続きが必須
- **Pros**
  - RLS を活用して DB 層で認可を厳密にできる
- **Cons**
  - Supabase の Third-Party Auth 機能が有効化されているか、ドキュメントに従い追加設定が必要
  - Firebase と Supabase の JWT 検証連携が複雑になり、運用コストが高い
  - 既存 RLS ポリシーの全面的な見直しが必要

## 推奨方針

**方式A**を推奨する。
理由は以下の通り。

1. 既存 RLS が「匿名でも投稿・投票可能」という UGC 前提で設計されているため、方式B に移行するとすべてのポリシーを書き直す必要がある。
2. 匿名投稿との後方互換を保つには、認証状態に応じて `user_id` を埋めるか NULL にするかの分岐がアプリ層で必要であり、これは方式Aの service_role 経由でも実現できる。
3. Firebase Admin SDK の ID トークン検証は比較的に標準的な実装パターンであり、短期間で安全に導入できる。

## 必要な環境変数（方式A）

### クライアント側（Firebase JS SDK）

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### サーバー側（Firebase Admin SDK）

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### 既存変数

```env
NEXT_PUBLIC_SUPABASE_URL=（既存）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（既存）
SUPABASE_SERVICE_ROLE_KEY=（既存）
```

## 次のステップ

1. **Human Gate①**: 方式Aまたは方式Bのどちらを採用するか承認を得る
2. Firebase プロジェクトの新規作成、または既存プロジェクトの共用可否を確認
3. 上記環境変数を取得（`upload-secrets` 経由または `.env.local` 共有）
4. Issue 1-2 以降（SDK 導入、スキーマ拡張など）に進む
