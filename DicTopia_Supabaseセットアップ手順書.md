# DicTopia（ディクトピア）Supabaseセットアップ手順書

| 項目 | 内容 |
|---|---|
| 文書種別 | 環境構築手順書（Supabase） |
| 対象プロジェクト | DicTopia（ディクトピア） |
| バージョン | v1.0 |
| 作成日 | 2026年8月16日 |
| 前提文書 | システム仕様書 v1.0／詳細設計書 v1.0 |

本書は、DicTopiaのバックエンドとして使用するSupabaseプロジェクトを、ローカル開発環境および本番環境（Vercel連携）向けに実際にセットアップする手順を記す。

---

## 1. 前提条件

- Node.js 18以上がインストール済みであること。
- Supabaseアカウント（https://supabase.com）を保有していること。
- Dockerがローカルにインストール済みであること（ローカルSupabase環境の起動に必要）。
- Next.jsプロジェクト（`dictopia/`）がすでに初期化されていること（詳細設計書 2章のディレクトリ構成を参照）。

---

## 2. Supabase CLIのインストール

```bash
# プロジェクトルートで実行（devDependencyとして導入）
npm install supabase --save-dev

# インストール確認
npx supabase --version
```

> グローバルインストールではなく、プロジェクトローカルへのインストールを推奨する（チームメンバー間でのバージョン差異を防ぐため）。

---

## 3. Supabaseプロジェクトの初期化（ローカル）

```bash
# プロジェクトルートで実行
npx supabase init
```

- `supabase/` ディレクトリが生成される（詳細設計書のディレクトリ構成と一致）。
- 生成された `supabase/config.toml` はそのままローカル開発用としてコミットして問題ない（機密情報は含まれない）。

---

## 4. マイグレーションファイルの配置

`supabase/migrations/0001_init.sql` を作成し、仕様書3章で定義したDDLを配置する。

```bash
mkdir -p supabase/migrations
```

`supabase/migrations/0001_init.sql` の内容（仕様書のDDLに加え、詳細設計書6.2章で必要となる**投票数アトミック更新用のRPC関数を追加**する）:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Topics Table (Weekly Contests)
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    week_code VARCHAR(10) UNIQUE NOT NULL
);

-- Words Table (Neologisms)
CREATE TABLE public.words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word VARCHAR(50) NOT NULL,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    votes_count INT DEFAULT 0 NOT NULL,
    reports_count INT DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    ai_context_tags TEXT[] DEFAULT '{}',
    ai_search_summary TEXT,
    CONSTRAINT word_length CHECK (char_length(word) >= 1)
);

-- Votes Log (Duplicate Prevention)
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    voter_hash VARCHAR(64) NOT NULL,
    CONSTRAINT unique_daily_vote UNIQUE (word_id, voter_hash)
);

-- Reactions Table
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    emoji_type VARCHAR(20) NOT NULL
);

-- Reports Table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    reporter_hash VARCHAR(64) NOT NULL
);

-- Indexes（検索・集計性能のため追加）
CREATE INDEX idx_words_topic_id ON public.words(topic_id);
CREATE INDEX idx_words_votes_count ON public.words(votes_count DESC) WHERE is_published = true;
CREATE INDEX idx_votes_word_id ON public.votes(word_id);
CREATE INDEX idx_reports_word_id ON public.reports(word_id);

-- Enable RLS
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to published words" ON public.words FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public insert to words" ON public.words FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read to topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow public insert to votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to reactions" ON public.reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to reports" ON public.reports FOR INSERT WITH CHECK (true);

-- RPC: 投票数のアトミックなインクリメント（詳細設計書6.2章 投票フローで使用）
CREATE OR REPLACE FUNCTION public.increment_votes_count(target_word_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count INT;
BEGIN
    UPDATE public.words
    SET votes_count = votes_count + 1
    WHERE id = target_word_id
    RETURNING votes_count INTO new_count;

    RETURN new_count;
END;
$$;

-- RPC: 通報数のインクリメント＋3件到達時の自動非公開（詳細設計書6.3章で使用）
CREATE OR REPLACE FUNCTION public.increment_reports_count(target_word_id UUID)
RETURNS TABLE(reports_count INT, auto_unpublished BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INT;
    unpublished BOOLEAN := false;
BEGIN
    UPDATE public.words
    SET reports_count = words.reports_count + 1
    WHERE id = target_word_id
    RETURNING words.reports_count INTO updated_count;

    IF updated_count >= 3 THEN
        UPDATE public.words SET is_published = false WHERE id = target_word_id;
        unpublished := true;
    END IF;

    RETURN QUERY SELECT updated_count, unpublished;
END;
$$;

-- RPC関数への実行権限を匿名ユーザー・認証済みユーザーの両方に明示的に付与
-- （投稿・投票・通報は認証不要のため、anonロールへの付与が必須）
GRANT EXECUTE ON FUNCTION public.increment_votes_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_reports_count(UUID) TO anon, authenticated;
```

> **補足**: 元の仕様書のDDLにはRPC関数（`increment_votes_count`, `increment_reports_count`）が含まれていなかったが、詳細設計書のシーケンス図でアトミック更新が前提となっているため、本手順書で明示的に追加した。この2関数は`SECURITY DEFINER`で定義し、匿名ユーザーからのRPC実行（INSERT権限と同様に公開）を許可する運用とする。

---

## 5. ローカルSupabase環境の起動

```bash
npx supabase start
```

初回起動時、以下の情報がターミナルに出力される。これらは後述の環境変数設定で使用するため控えておく。

- `API URL`（例: `http://127.0.0.1:54321`）
- `anon key`
- `service_role key`
- `Studio URL`（例: `http://127.0.0.1:54323`、ブラウザでテーブル内容を確認できるGUI）

マイグレーションの適用:

```bash
npx supabase db reset
```

> `db reset` はローカルDBを初期化した上で `supabase/migrations/` 内のSQLを全て適用する。テーブル構成に変更を加えた場合は毎回このコマンドで再適用して整合性を確認する。

---

## 6. シードデータの投入

`supabase/seed.sql` を作成し、初期のお題と造語10件を投入する（`db reset` 実行時に自動適用される）。

```sql
-- お題（アクティブな週）
INSERT INTO public.topics (title, description, is_active, week_code)
VALUES ('今週のお題：「令和の新常識」を一言で表すと？', '令和らしい価値観や行動を、一言の造語で表現してみよう', true, '2026-W34');

-- サンプル造語10件
INSERT INTO public.words (word, definition, example_sentence, votes_count) VALUES
('タイパ疲れ', 'タイムパフォーマンスを追求しすぎて逆に疲弊してしまう現象', '倍速視聴しすぎてタイパ疲れした。', 12),
('既読ジレンマ', 'すぐ返信したいが忙しいふりをしたくて既読のまま数時間放置する葛藤', '既読ジレンマで返信が朝になった。', 8),
('推し疲労', '推し活が楽しい反面、スケジュールや出費で疲れてしまう状態', '推し疲労で今週末は家で寝ていたい。', 15),
('会議シュレッダー', '長時間の会議で議論の中身が細切れになり結論が消える現象', 'また会議シュレッダーで何も決まらなかった。', 5),
('リモート筋肉痛', '在宅勤務で座りっぱなしにより発生する謎の筋肉痛', 'リモート筋肉痛で肩が上がらない。', 9),
('通知断食', 'スマホ通知を意図的にオフにして集中力を取り戻す習慣', '休日は通知断食して読書に集中する。', 3),
('サブスク墓場', '契約したまま使わなくなったサブスクサービスの集合体', '気づいたらサブスク墓場に月5000円払っていた。', 20),
('検索疲れ', '選択肢が多すぎて検索しすぎた結果、逆に決められなくなる状態', 'レストラン選びで検索疲れして結局いつもの店に行った。', 6),
('あと5分症候群', 'あと5分で終わるはずの作業が延々と終わらない現象', 'あと5分症候群でレポートが朝までかかった。', 11),
('既視感ループ', 'SNSで同じような内容ばかり流れてきて既視感が続く状態', 'タイムラインが既視感ループでつまらない。', 4);
```

投入確認（Studio UIまたはCLIで実行）:

```bash
npx supabase db reset   # seed.sqlも含めて再適用される
```

---

## 7. Next.jsプロジェクトへの接続

### 7.1 必要パッケージのインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 7.2 環境変数の設定

プロジェクトルートに `.env.local` を作成する（**Gitにコミットしない。`.gitignore` に含まれていることを確認**）。

```bash
# ローカル開発用（npx supabase start の出力値を使用）
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ローカルのanon key>
SUPABASE_SERVICE_ROLE_KEY=<ローカルのservice_role key>

OPENAI_API_KEY=<OpenAIのAPIキー>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local.example` も併せて作成し、値を空にしたテンプレートをGit管理下に置く（チームメンバーや将来の自分がセットアップしやすいようにするため）。

### 7.3 クライアント初期化コードの作成

**`lib/supabase/client.ts`**（ブラウザ用）

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`lib/supabase/server.ts`**（Server Component / Route Handler用）

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**`lib/supabase/admin.ts`**（Service Role・サーバー限定・RLSバイパスが必要な処理用）

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 注意: このクライアントはRoute Handler等のサーバーサイドコードでのみ使用すること。
// クライアントコンポーネントに絶対にインポートしないこと（Service Role Keyの漏洩防止）。
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

---

## 8. 動作確認

### 8.1 Supabase Studioでのテーブル確認

1. ブラウザで `http://127.0.0.1:54323` を開く。
2. 「Table Editor」から `topics` / `words` / `votes` / `reactions` / `reports` の5テーブルが存在することを確認する。
3. `words` テーブルにシードデータ10件が投入されていることを確認する。

### 8.2 RLSポリシーの動作確認（SQL Editorで実行）

```sql
-- anonロールとして公開済みのwordsのみ見えることを確認
SET ROLE anon;
SELECT id, word, is_published FROM public.words; -- is_published=falseの行は存在しないため全件trueのはず
RESET ROLE;
```

### 8.3 RPC関数の動作確認

```sql
-- 適当なword_idを指定して投票数が1増えることを確認
SELECT public.increment_votes_count('<既存のword id>');
```

### 8.4 Next.js側からの疎通確認

`app/page.tsx` を仮実装し、`words` テーブルから1件取得してコンソール出力するだけの簡易確認を行い、`.env.local` の値が正しく読み込まれていることを確認する。

---

## 9. 本番環境（Vercel）へのセットアップ

### 9.1 Supabase本番プロジェクトの作成

1. https://supabase.com/dashboard で「New Project」を作成する。
2. リージョンは、想定ユーザー層（日本国内）を考慮し `Northeast Asia (Tokyo)` を選択する。
3. プロジェクト作成完了後、「Project Settings」→「API」から本番用の `Project URL`・`anon key`・`service_role key` を控える。

### 9.2 本番マイグレーションの適用

```bash
# Supabase CLIで本番プロジェクトにログイン・リンク
npx supabase login
npx supabase link --project-ref <本番プロジェクトのref>

# ローカルのマイグレーションを本番に適用
npx supabase db push
```

> `db push` は `supabase/migrations/` 内の未適用マイグレーションのみを本番に反映する。事前に `npx supabase db diff` で差分を確認してから実行することを推奨する。

### 9.3 Vercel環境変数の設定

Vercelプロジェクトの「Settings」→「Environment Variables」に以下を設定する（Production/Preview両方）。

| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番SupabaseのProject URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番のanon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 本番のservice_role key（**Sensitiveとしてマーク**） |
| `OPENAI_API_KEY` | OpenAIのAPIキー（**Sensitiveとしてマーク**） |
| `NEXT_PUBLIC_SITE_URL` | 本番ドメイン（例: `https://dictopia.app`） |

### 9.4 本番シードデータについて

- 本番環境には `seed.sql` のようなダミーデータを投入せず、実運用開始時の「今週のお題」1件のみを手動でInsertする運用とする（テスト用の10件のジョークワードは本番投入しない）。

---

## 10. トラブルシューティング

| 症状 | 原因・対処 |
|---|---|
| `npx supabase start` でDocker関連エラー | Docker Desktopが起動していない可能性。起動後に再実行する。 |
| RLSにより投稿・投票のINSERTが失敗する | ポリシー名の重複やRLS有効化のし忘れがないか、`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` が全テーブルに実行されているか確認する。 |
| `increment_votes_count` / `increment_reports_count` を呼んでも反映されない | `0001_init.sql` 内の `GRANT EXECUTE` 文が適用されているか確認する（マイグレーションに含まれている前提）。適用されていない場合は `npx supabase db reset`（本番は `db push`）を再実行する。 |
| ローカルとStudioでデータが食い違う | `db reset` 未実行、または複数のSupabaseローカルインスタンスが起動している可能性。`npx supabase status` で状態を確認する。 |
| 本番 `db push` が失敗する | ローカルとリモートのマイグレーション履歴に差分がある可能性。`npx supabase db diff` で差分を確認し、必要であれば手動でマイグレーション履歴を整合させる。 |

---

## 11. チェックリスト（このセットアップの完了条件）

- [ ] `npx supabase start` でローカル環境が起動する
- [ ] `supabase/migrations/0001_init.sql` が全テーブル・RLSポリシー・RPC関数を含めて正常に適用される
- [ ] `supabase/seed.sql` によりお題1件・造語10件が投入される
- [ ] `.env.local` が正しく設定され、Next.jsアプリからデータ取得できる
- [ ] Supabase Studioで各テーブルとRLSポリシーが確認できる
- [ ] 本番Supabaseプロジェクトが作成され、`db push` でマイグレーションが反映されている
- [ ] Vercelに全環境変数が設定されている
