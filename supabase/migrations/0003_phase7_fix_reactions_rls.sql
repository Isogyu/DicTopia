-- Phase 7: reactions テーブルの SELECT 権限を public ロールに付与
-- ホームの人気/新着ワードカードでリアクション数を集計するため
GRANT SELECT ON public.reactions TO anon, authenticated;

CREATE POLICY "Allow public read access to reactions" ON public.reactions FOR SELECT USING (true);
