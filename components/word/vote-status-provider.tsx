"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface VoteStatusContextValue {
  /** 取得済みかつ投票済みなら true。未取得のあいだは false。 */
  isVoted: (wordId: string) => boolean;
  /** 投票成功時にクライアント側の状態を更新する */
  markVoted: (wordId: string) => void;
  /** 表示中の造語を登録する。バッチ取得の対象になる。 */
  register: (wordId: string) => void;
}

const VoteStatusContext = createContext<VoteStatusContextValue | null>(null);

/** 1 リクエストで問い合わせる上限（URL 長とサーバー負荷の兼ね合い） */
const BATCH_LIMIT = 100;

/**
 * 投票済み判定のバッチ取得。
 *
 * 従来は WordCard ごとに `GET /api/words/[id]/vote` を呼んでいたため、
 * トップページを開くだけで表示カード数ぶんのリクエスト（= Service Role 経由の
 * DB 往復）が発生していた。マウントされた造語 ID をまとめ、
 * 1 回の `GET /api/votes/status` で解決する。
 */
export function VoteStatusProvider({ children }: { children: ReactNode }) {
  const [voted, setVoted] = useState<Set<string>>(() => new Set());
  const pendingRef = useRef<Set<string>>(new Set());
  const requestedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const ids = Array.from(pendingRef.current).slice(0, BATCH_LIMIT);
    pendingRef.current = new Set();
    if (ids.length === 0) return;

    try {
      const res = await fetch(`/api/votes/status?ids=${ids.join(",")}`);
      if (!res.ok) return;
      const body = (await res.json()) as { voted?: string[] };
      if (!body.voted || body.voted.length === 0) return;

      setVoted((prev) => {
        const next = new Set(prev);
        body.voted?.forEach((id) => next.add(id));
        return next;
      });
    } catch {
      // 取得できなくても投票操作自体は可能（重複はサーバー側で弾かれる）
    }
  }, []);

  const register = useCallback(
    (wordId: string) => {
      if (requestedRef.current.has(wordId)) return;
      requestedRef.current.add(wordId);
      pendingRef.current.add(wordId);

      if (timerRef.current) clearTimeout(timerRef.current);
      // 同一レンダリングでマウントされたカードをまとめるための短い待ち
      timerRef.current = setTimeout(() => void flush(), 50);
    },
    [flush]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const markVoted = useCallback((wordId: string) => {
    setVoted((prev) => new Set(prev).add(wordId));
  }, []);

  const isVoted = useCallback((wordId: string) => voted.has(wordId), [voted]);

  const value = useMemo(
    () => ({ isVoted, markVoted, register }),
    [isVoted, markVoted, register]
  );

  return (
    <VoteStatusContext.Provider value={value}>
      {children}
    </VoteStatusContext.Provider>
  );
}

/** Provider が無い文脈でも壊れないフォールバック付きのフック */
export function useVoteStatus(wordId: string) {
  const ctx = useContext(VoteStatusContext);

  useEffect(() => {
    ctx?.register(wordId);
  }, [ctx, wordId]);

  return {
    voted: ctx?.isVoted(wordId) ?? false,
    markVoted: () => ctx?.markVoted(wordId),
  };
}
