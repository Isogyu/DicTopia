-- Phase 8: リアクションの重複防止と、一覧・検索クエリ向けインデックス
SET search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- 1. リアクションの重複防止
--    従来は誰が押したかを記録しておらず、リロードするだけで
--    同じ造語に何度でもリアクションを積めた（人気度の指標が意味を失う）。
--    投票と同じ「IP + UA + 日付」ハッシュを持たせ、同日同絵文字を 1 回に制限する。
--    既存行は hash を持たないため、NULL 許容のまま部分インデックスで一意化する。
-- ---------------------------------------------------------------------------
ALTER TABLE public.reactions
  ADD COLUMN IF NOT EXISTS reactor_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_reaction
  ON public.reactions (word_id, emoji_type, reactor_hash)
  WHERE reactor_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reactions_word_id
  ON public.reactions (word_id);

-- ---------------------------------------------------------------------------
-- 2. 一覧・カテゴリ絞り込み用インデックス
--    /words と /words/[category] は「カテゴリ + 新着順 / 人気順」で引く。
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_words_published_created_at
  ON public.words (created_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_words_category_created_at
  ON public.words (category, created_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_words_category_votes
  ON public.words (category, votes_count DESC)
  WHERE is_published = true;

-- ---------------------------------------------------------------------------
-- 3. 部分一致検索の高速化
--    ILIKE '%...%' は通常の B-tree では効かないため、pg_trgm の GIN を張る。
--    造語が増えるほど効果が大きい。
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_words_word_trgm
  ON public.words USING gin (word gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_words_definition_trgm
  ON public.words USING gin (definition gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 4. 権限
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.reactions TO anon, authenticated;
