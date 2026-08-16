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

-- サービスロール（Route Handler 用）にもテーブル操作権限を付与
GRANT SELECT, INSERT, UPDATE, DELETE ON public.words TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO service_role;
GRANT SELECT ON public.topics TO service_role;

-- RPC関数への実行権限を匿名ユーザー・認証済みユーザー・サービスロールに付与
-- （投稿・投票・通報は認証不要のため、anonロールへの付与が必須）
GRANT EXECUTE ON FUNCTION public.increment_votes_count(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_reports_count(UUID) TO anon, authenticated, service_role;
