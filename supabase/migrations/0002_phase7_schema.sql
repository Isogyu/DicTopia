-- Phase 7: words 列追加 / comments テーブル新規 / user_id 受け皿

-- 1. words テーブル拡張
ALTER TABLE public.words
  ADD COLUMN nickname VARCHAR(30),
  ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'その他'
    CHECK (category IN ('ライフスタイル', '感情・感性', '仕事・ビジネス', 'ネット・SNS', '恋愛・人間関係', 'その他')),
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_words_category ON public.words(category);
CREATE INDEX idx_words_user_id ON public.words(user_id);

-- 2. comments テーブル新規作成
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    nickname VARCHAR(30),
    body VARCHAR(200) NOT NULL,
    commenter_hash VARCHAR(64) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT comment_body_length CHECK (char_length(body) >= 1)
);

CREATE INDEX idx_comments_word_id ON public.comments(word_id, created_at DESC);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- 3. RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert to comments" ON public.comments FOR INSERT WITH CHECK (true);

-- 4. 権限
GRANT SELECT, INSERT ON public.comments TO anon, authenticated;
GRANT ALL ON public.comments TO service_role;
