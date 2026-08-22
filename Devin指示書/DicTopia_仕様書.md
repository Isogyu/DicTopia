# DicTopia（ディクトピア）システム仕様書

| 項目 | 内容 |
|---|---|
| 文書種別 | システム仕様書（要件定義 兼 基本設計） |
| プロジェクト名 | DicTopia（ディクトピア） |
| バージョン | v1.0 |
| 作成日 | 2026年8月15日 |
| 想定読者 | 開発担当（Devin等のAIコーディングエージェント含む）、実装レビュー担当 |

---

## 1. プロジェクト概要

### 1.1 コンセプト
DicTopiaは、ユーザーがこの世に存在しない新語（造語）を発明し、意味を定義し、週替わりのお題コンテストへ投稿・投票し、動的に生成されるバイラルOGPカードとともにX（Twitter）でシェアできる、**低摩擦・高速なUGC（ユーザー生成コンテンツ）型ミーム辞書プラットフォーム**である。

### 1.2 バリュープロポジション
- 投稿から公開までの摩擦を極小化する（ログイン不要・数クリックで投稿完了）。
- AIモデレーションにより不適切投稿を即時排除し、健全なコミュニティを維持する。
- SNS上でバズることを前提とした、シェアされやすいビジュアル（動的OGPカード）を自動生成する。
- Programmatic SEOにより、個々の造語ページが検索流入の窓口となる設計とする。

### 1.3 開発方針
- Next.js App Router を用いた、本番運用に耐えうる（Production-ready）・技術的負債ゼロを目指すアーキテクチャとする。
- パフォーマンス・UIの簡潔さ・自動化されたAIモデレーション・堅牢なProgrammatic SEOを重視する。

---

## 2. システム構成（技術スタック）

| レイヤー | 採用技術 |
|---|---|
| フレームワーク | Next.js 14+（App Router / Server Actions / Route Handlers） |
| 言語 | TypeScript（Strict Mode） |
| スタイリング | Tailwind CSS + shadcn/ui（Radix UI） |
| DB・認証 | Supabase（PostgreSQL / Supabase Auth / Row Level Security） |
| 画像生成 | `@vercel/og`（Edge上での動的OGP画像生成） |
| AI連携 | OpenAI API<br>・`/v1/moderations`（投稿内容の自動モデレーション）<br>・`gpt-4o-mini`（SEO用タグ・要約の自動生成） |
| デプロイ先 | Vercel |

---

## 3. データベース設計（Supabase / PostgreSQL）

### 3.1 テーブル一覧

| テーブル名 | 役割 |
|---|---|
| `topics` | 週替わりのお題（コンテスト）を管理 |
| `words` | 投稿された造語本体 |
| `votes` | 投票ログ（同一ユーザーの重複投票防止） |
| `reactions` | 絵文字リアクション |
| `reports` | 通報ログ |

### 3.2 テーブル定義

**topics（お題）**

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, default uuid_generate_v4() | |
| created_at | timestamptz | NOT NULL, default now() | |
| title | varchar(120) | NOT NULL | お題タイトル |
| description | text | | お題の説明 |
| is_active | boolean | NOT NULL, default false | 現在有効なお題かどうか |
| week_code | varchar(10) | UNIQUE, NOT NULL | 例: `2026-W32` |

**words（造語）**

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, default uuid_generate_v4() | |
| created_at | timestamptz | NOT NULL, default now() | |
| word | varchar(50) | NOT NULL, CHECK(char_length >= 1) | 造語本体 |
| definition | text | NOT NULL | 意味・定義 |
| example_sentence | text | | 例文（任意） |
| topic_id | UUID | FK → topics.id, ON DELETE SET NULL | 紐づくお題 |
| votes_count | int | NOT NULL, default 0 | 投票数（非正規化カラム） |
| reports_count | int | NOT NULL, default 0 | 通報数（非正規化カラム） |
| is_published | boolean | NOT NULL, default true | 公開フラグ |
| ai_context_tags | text[] | default '{}' | AI生成のSEO用タグ（3〜5個） |
| ai_search_summary | text | | AI生成の1文解説（SEO用） |

**votes（投票ログ）**

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, default uuid_generate_v4() | |
| created_at | timestamptz | NOT NULL, default now() | |
| word_id | UUID | FK → words.id, ON DELETE CASCADE, NOT NULL | |
| voter_hash | varchar(64) | NOT NULL | `SHA-256(IP + User-Agent + 当日日付)` |
| | | UNIQUE(word_id, voter_hash) | 同一ハッシュによる同日重複投票を禁止 |

**reactions（絵文字リアクション）**

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, default uuid_generate_v4() | |
| created_at | timestamptz | NOT NULL, default now() | |
| word_id | UUID | FK → words.id, ON DELETE CASCADE, NOT NULL | |
| emoji_type | varchar(20) | NOT NULL | `fire` / `laugh` / `cry` / `clap` のいずれか |

**reports（通報）**

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, default uuid_generate_v4() | |
| created_at | timestamptz | NOT NULL, default now() | |
| word_id | UUID | FK → words.id, ON DELETE CASCADE, NOT NULL | |
| reason | text | | 通報理由 |
| reporter_hash | varchar(64) | NOT NULL | 通報者の匿名ハッシュ |

> **注記**: インデックス定義およびRPC関数（`increment_votes_count`, `increment_reports_count`）を含む最終的なDDLは、Supabaseセットアップ手順書の内容を正とする。本章は論理設計としてのテーブル構造を示すものであり、実行するSQLは必ずセットアップ手順書側を参照すること。

### 3.3 Row Level Security（RLS）ポリシー

| テーブル | ポリシー名 | 内容 |
|---|---|---|
| words | Allow public read access to published words | `is_published = true` の行のみSELECT許可 |
| words | Allow public insert to words | 誰でもINSERT可（投稿は匿名で許可） |
| topics | Allow public read to topics | 全件SELECT許可 |
| votes | Allow public insert to votes | 誰でもINSERT可（UNIQUE制約で重複防止） |
| reactions | Allow public insert to reactions | 誰でもINSERT可 |
| reports | Allow public insert to reports | 誰でもINSERT可 |

> 実装時の注意: `words`・`votes`・`reactions`・`reports` へのUPDATE/DELETEは公開ポリシーを設けない（サーバー側のRoute Handler／RPC経由の操作に限定し、クライアントから直接の更新・削除はできない構成とする）。

---

## 4. 機能要件

### 4.1 造語投稿パイプライン（低摩擦投稿フロー）

**エンドポイント**: `POST /api/words`

処理フロー:
1. ユーザーが `word`（造語）、`definition`（意味）、`example_sentence`（例文・任意）、`topic_id`（お題ID・任意）を送信。
2. **事前モデレーションチェック**
   - 入力テキストをOpenAI Moderation API（`/v1/moderations`）へ送信。
   - `flagged === true` の場合、即座に投稿を拒否する。
     - レスポンス: `HTTP 422`
     - メッセージ: `「公序良俗に反する単語・表現が含まれているため登録できません」`
3. **バックグラウンドAI SEOエンリッチメント**
   - `gpt-4o-mini` を呼び出し、以下を生成する。
     - `ai_context_tags`: 意味的なタグを3〜5個抽出
     - `ai_search_summary`: 1文の分析的コメンタリー
4. `public.words` テーブルへINSERT。

### 4.2 投票・リアルタイムリアクション機能

**投票**: `POST /api/words/[id]/vote`
1. サーバー側で `voter_hash` を生成する（`IP + User-Agent + 当日UTC日付(YYYY-MM-DD)` のSHA-256）。
2. `public.votes` へINSERTを試行。
3. 主キー／UNIQUE制約違反（＝本日すでに投票済み）の場合:
   - レスポンス: `HTTP 429`
   - メッセージ: `「本日はこの造語にすでに投票済みです」`
4. 成功時、SupabaseのRPC関数 `increment_votes_count(word_id)` を呼び出し、`public.words.votes_count` をアトミックにインクリメントする（RPC定義はSupabaseセットアップ手順書を正とする）。

**絵文字リアクション**: `POST /api/words/[id]/react`
1. `public.reactions` へ即座にINSERTする。
2. フロントエンド側で楽観的UI更新（Optimistic Update）をトリガーする。

### 4.3 自動通報・モデレーショントリガー

**エンドポイント**: `POST /api/words/[id]/report`
1. `public.reports` へINSERT。
2. SupabaseのRPC関数 `increment_reports_count(word_id)` を呼び出し、`reports_count` の加算と自動非公開判定をアトミックに行う（RPC定義はSupabaseセットアップ手順書を正とする）。
3. **自動非公開ルール**: `reports_count >= 3` になった時点で、当該造語の `is_published` を自動的に `false` へ更新する（上記RPC内部で実施し、加算と判定の間に競合状態が生じないようにする）。

### 4.4 動的Edge OGPカード生成

**エンドポイント**: `GET /api/og/word/[id]`

- Next.js Edge Route上で `@vercel/og` の `ImageResponse` を用いて実装。
- キャンバスサイズ: 1200 × 630 px。
- デザイン: ダークモード基調（背景色 `#0f172a`）、エレクトリックブルー／シアン系のアクセントカラー、太字タイポグラフィ。
- 表示内容:
  - ヘッダー: 「DicTopia | 創作ミーム・造語辞書」
  - メインテキスト: `word`（フォントサイズ64px・エクストラボールド）
  - サブテキスト: `definition`（最大120文字）
  - フッター: 現在の投票数 ＋「今週の流行語候補」バッジ
- 対象の `word_id` が存在しない場合は、DicTopiaロゴのみのフォールバック画像を `200` で返す（エラーで落とさない）。

---

## 5. SEO・Programmatic SEOページ設計

### 5.1 造語個別ページ（`/word/[id]`）
- レンダリング方式: SSR（ISR、`revalidate = 60`）。
- メタタグ:
  - `title`: `【新語】${word}（意味：${definition}）| DicTopia`
  - OGP画像: `/api/og/word/${id}` を動的に指定。
- 構造化データ（JSON-LD）を埋め込む。スキーマは `DefinedTerm` を使用し、`name` に造語、`description` に定義、`inDefinedTermSet` に `"DicTopia Neologism Dictionary"` を設定する。

### 5.2 主要ページ構成

| パス | ページ名 | 内容 |
|---|---|---|
| `/` | ホーム | 進行中のお題（「今週のお題」）を紹介するヒーローバナー、投票数トップ10リーダーボード（「今週のバズ造語」）、新着投稿一覧（「新着造語」） |
| `/word/[id]` | 造語個別ページ | 造語詳細＋SEOメタデータ＋JSON-LD |
| `/hall-of-fame` | 殿堂入り | `week_code` ごとにグルーピングし、過去の週間1位獲得ワードを一覧表示 |

---

## 6. UI/UXデザインシステム

### 6.1 グローバルテーマ
- ダークスレート基調（`bg-slate-950` / `text-slate-50`）。
- Product HuntとUrban Dictionaryを掛け合わせたような、モダンで高密度・バイラルミーム系のトーン。

### 6.2 主要コンポーネント

| コンポーネント | 仕様 |
|---|---|
| Navbar | アプリロゴ、「今週のお題」バッジ、「造語を作る」プライマリCTAボタン（Drawer／Modalを起動） |
| HeroTopicCard | 進行中のお題表示、週次リセット（毎週日曜23:59 JST）までのカウントダウン、クイック投稿用の簡易入力欄 |
| WordCard | 造語タイトル・定義・例文ブロック／アニメーション付き楽観的更新カウンター付き投票ボタン／絵文字リアクションバー（🔥😂😭👏）／「X（Twitter）でシェア」ボタン（動的OGP URLと `#DicTopia` を含むツイートインテントを開く）／通報アイコン |
| SubmissionModal | 投稿フォーム（造語: 最大30文字、定義: 最大200文字の文字数カウンター付き） |

---

## 7. API仕様一覧

| メソッド | パス | 概要 | 主なレスポンス |
|---|---|---|---|
| POST | `/api/words` | 造語の新規投稿 | 201: 作成された造語 / 422: モデレーション拒否 |
| POST | `/api/words/[id]/vote` | 投票 | 200: 更新後の投票数 / 429: 本日投票済み |
| POST | `/api/words/[id]/react` | 絵文字リアクション | 201: リアクション登録完了 |
| POST | `/api/words/[id]/report` | 通報 | 201: 通報登録完了（3件到達時は自動非公開） |
| GET | `/api/og/word/[id]` | OGP画像の動的生成 | 200: 1200×630pxの画像（image/png等） |

---

## 8. 非機能要件

- **パフォーマンス**: 造語個別ページはISR（60秒キャッシュ）でCDN配信し、高速な初期表示を実現する。
- **セキュリティ**: 投票・通報はIPとUser-Agentに基づく匿名ハッシュで不正防止する（個人を特定する情報は保存しない）。RLSにより、クライアントからの不正な直接更新・削除を防ぐ。
- **モデレーション**: 投稿時点でOpenAI Moderation APIによる事前検閲を必須とし、通報3件到達で自動非公開とする二段構えの安全設計とする。
- **SEO**: 個別ページごとに動的メタタグ・JSON-LD構造化データ・OGP画像を自動生成し、検索エンジン経由の流入を最大化する。
- **レスポンシブ対応**: モバイルファーストで実装し、スマートフォンでの閲覧・投稿・シェア体験を最優先する。

---

## 9. 実装ロードマップ（Definition of Done）

以下のフェーズ順に実装を進めること。

**Phase 1: 基盤・DBセットアップ**
- Next.js App Router（TypeScript・Tailwind CSS・shadcn/ui）を初期化する。
- Supabaseクライアント（`@supabase/supabase-js`, `@supabase/ssr`）を設定し、本仕様書 3章のSQLマイグレーションを実行する。

**Phase 2: コアAPIルート・モデレーション**
- `/api/words`、`/api/words/[id]/vote`、`/api/words/[id]/react`、`/api/words/[id]/report` を実装する。
- OpenAI Moderation APIを `/api/words` に組み込む。

**Phase 3: 動的Edge OGP**
- `@vercel/og` を用いて `/api/og/word/[id]` を実装し、画像が正しくレンダリングされることを確認する。

**Phase 4: フロントエンドのコンポーネントツリー・ページ**
- `/`、`/word/[id]`、`/hall-of-fame` を実装する。
- モバイルファーストのレスポンシブUI、ダークテーマを適用する。

**Phase 5: 検証・モックデータ投入**
- ユーモラス・共感性のある初期造語10件、有効なお題1件をシードする。
- 投票のレート制限、通報による自動非公開、動的OGP生成、JSON-LDレンダリングが正しく機能することを検証する。

---

## 10. 用語集

| 用語 | 説明 |
|---|---|
| UGC | User Generated Content。ユーザーが自ら作成・投稿するコンテンツ |
| OGP | Open Graph Protocol。SNS等でシェアされた際のリンクプレビュー表示規格 |
| ISR | Incremental Static Regeneration。一定間隔で静的ページを再生成するNext.jsのレンダリング方式 |
| RLS | Row Level Security。PostgreSQLの行単位アクセス制御機能 |
| Programmatic SEO | 大量のページを自動生成・最適化し、検索流入を獲得する手法 |
