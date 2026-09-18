# DicTopia Implementation State

## 現在のIssue
なし（Phase 8 完了）

## Phase 8: グロース基盤 & 品質改善
マーケティング観点（集客・回遊・拡散）とエンジニアリング観点（正確性・性能・安全性）の両面から棚卸しし、以下を実施。

### 集客（SEO）
- [x] `app/sitemap.ts` / `app/robots.ts` を追加（従来はどちらも 404）
- [x] ルート `metadata` の刷新：title テンプレート、OGP、Twitter Card、canonical
- [x] サイト共通 OGP 画像 `/api/og` を追加、造語 OGP をブランドカラーへ刷新
- [x] 構造化データ：WebSite + SearchAction / DefinedTerm / BreadcrumbList / ItemList / FAQPage
- [x] 造語詳細を `force-dynamic` から ISR（`revalidate`）へ

### 回遊
- [x] 造語一覧 `/words` とカテゴリ別一覧 `/words/[category]`（新着順 / 人気順・ページング）
- [x] 検索結果ページ `/search`（従来はドロップダウンのみで着地先が無かった）
- [x] 使い方ページ `/about` を実装し、`/coming-soon` は 308 リダイレクトへ
- [x] 造語詳細に関連造語・パンくずを追加
- [x] フッター / 404 にカテゴリ内部リンクを追加

### 拡散
- [x] 投稿完了画面を追加し、投稿 → シェアの導線を接続（従来はモーダルが閉じるだけ）
- [x] シェア文言に意味を含める + Web Share API 対応 + 誤字「作語」を修正
- [x] `NEXT_PUBLIC_SITE_URL` 未設定時のフォールバック（従来はシェアが無反応）

### 正確性・安全性
- [x] 検索 API のフィルタインジェクションを修正（`,` 1 文字でクエリが壊れる状態だった）
- [x] リアクションの重複防止（`reactor_hash` + 一意インデックス、未適用環境へのフォールバック付き）
- [x] 書き込み系 API 全てにレートリミットを追加
- [x] セキュリティヘッダ追加（X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy）
- [x] 通報の `mailto:` を廃止（`NEXT_PUBLIC_ADMIN_EMAIL` のクライアント露出を解消）
- [x] 不正な UUID の造語 URL を 404 に

### 性能
- [x] 投票済み判定をカードごとの N 回リクエストから 1 回のバッチ取得へ
- [x] お題の 3 重フェッチ / 投稿モーダルの 3 重マウントを Provider 1 つへ集約
- [x] 殿堂入りの全件取得をやめ、上位 30 件に限定
- [x] 一覧・検索向けインデックスと pg_trgm を追加（migration 0004）

### UI / アクセシビリティ
- [x] 共通モーダル（ESC・フォーカストラップ・背面スクロール固定）
- [x] `alert()` をトーストへ置換
- [x] タップターゲットを 44px 以上に
- [x] 相対時刻のハイドレーション不一致を解消
- [x] モバイルで検索をヘッダーに常時表示
- [x] 詳細ページを一覧カードの流用から専用レイアウトへ

## 未対応 / 次の候補
- レートリミットの分散化（Upstash Redis / Vercel KV）
- 絵文字ごとのリアクション数表示（集計ビューが必要）
- ユーザーアカウントとマイページ
- 週次お題の運用フロー（現在フラグ OFF）

## 備考
- migration `0004_reaction_dedupe_and_indexes.sql` の適用が必要（未適用でもアプリは動作するが、リアクションの重複防止は無効）
