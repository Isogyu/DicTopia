"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { SubmissionModal } from "./submission-modal";
import type { Topic } from "@/types/database";

interface SubmissionContextValue {
  /** 投稿モーダルを開く。造語名を先に決めている場合は渡す。 */
  openSubmission: (initialWord?: string) => void;
}

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

/**
 * 投稿モーダルをアプリ全体で 1 つだけ持つためのプロバイダ。
 *
 * 従来は Navbar / HeroCta / BottomCta がそれぞれ
 * ・topics テーブルへの同一クエリ
 * ・SubmissionModal のインスタンス
 * を個別に持っていたため、トップ表示のたびに同じ問い合わせが 3 回走っていた。
 * お題はサーバー側で 1 度だけ取得して props で流し込む。
 */
export function SubmissionProvider({
  activeTopic,
  children,
}: {
  activeTopic: Topic | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initialWord, setInitialWord] = useState("");

  const openSubmission = useCallback((word?: string) => {
    setInitialWord(word ?? "");
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openSubmission }), [openSubmission]);

  return (
    <SubmissionContext.Provider value={value}>
      {children}
      <SubmissionModal
        activeTopic={activeTopic}
        open={open}
        onOpenChange={setOpen}
        initialWord={initialWord}
        onSubmitted={() => router.refresh()}
      />
    </SubmissionContext.Provider>
  );
}

export function useSubmission(): SubmissionContextValue {
  const ctx = useContext(SubmissionContext);
  if (!ctx) {
    throw new Error("useSubmission は SubmissionProvider の内側で使用してください");
  }
  return ctx;
}
