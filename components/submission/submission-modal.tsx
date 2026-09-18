"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createWordSchema, type CreateWordInput } from "@/lib/validation";
import { CATEGORIES } from "@/lib/categories";
import { FEATURE_WEEKLY_TOPIC } from "@/lib/config";
import type { Topic, Word } from "@/types/database";
import type { CreateWordResponse } from "@/types/api";
import { SubmissionSuccess } from "./submission-success";

interface SubmissionModalProps {
  activeTopic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 投稿成功時。一覧の再取得など、呼び出し側の後処理に使う */
  onSubmitted?: (word: Word) => void;
  initialWord?: string;
}

export function SubmissionModal({
  activeTopic,
  open,
  onOpenChange,
  onSubmitted,
  initialWord = "",
}: SubmissionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  // 投稿完了後にシェア導線を出すため、作成された造語を保持する
  const [created, setCreated] = useState<Word | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWordInput>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: initialWord,
      definition: "",
      example_sentence: "",
      topic_id: FEATURE_WEEKLY_TOPIC ? activeTopic?.id : undefined,
      nickname: "",
      category: "その他",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      word: initialWord,
      definition: "",
      example_sentence: "",
      topic_id: FEATURE_WEEKLY_TOPIC ? activeTopic?.id : undefined,
      nickname: "",
      category: "その他",
    });
    setServerError(null);
    setCreated(null);
  }, [open, activeTopic, initialWord, reset]);

  const word = watch("word") ?? "";
  const definition = watch("definition") ?? "";
  const nickname = watch("nickname") ?? "";

  const onSubmit = async (data: CreateWordInput) => {
    setServerError(null);

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await res.json()) as CreateWordResponse;

      if (res.ok && result.success) {
        // モーダルは閉じず、シェア導線付きの完了画面に切り替える
        setCreated(result.data);
        onSubmitted?.(result.data);
        return;
      }

      if (res.status === 429) {
        setServerError(
          "短時間に投稿しすぎています。少し時間をおいてからお試しください"
        );
        return;
      }

      setServerError(
        !result.success && result.error
          ? result.error
          : "投稿に失敗しました。時間をおいて再度お試しください"
      );
    } catch {
      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    }
  };

  const close = () => onOpenChange(false);

  if (created) {
    return (
      <Modal
        open={open}
        onClose={close}
        title="投稿しました！"
        titleId="submission-success-title"
      >
        <SubmissionSuccess
          word={created}
          onClose={close}
          onCreateAnother={() => {
            setCreated(null);
            reset({
              word: "",
              definition: "",
              example_sentence: "",
              topic_id: FEATURE_WEEKLY_TOPIC ? activeTopic?.id : undefined,
              nickname: "",
              category: "その他",
            });
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="新しい造語を作る"
      titleId="submission-title"
    >
      {FEATURE_WEEKLY_TOPIC && activeTopic && (
        <p className="mb-4 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
          今週のお題：{activeTopic.title}
        </p>
      )}

      {serverError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="word" className="mb-1 block text-sm font-medium">
            造語 <span className="text-destructive">*</span>
          </label>
          <input
            id="word"
            type="text"
            maxLength={30}
            autoComplete="off"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="例：タイパ疲れ"
            aria-invalid={errors.word ? "true" : "false"}
            {...register("word")}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-destructive">{errors.word?.message}</span>
            <span className="text-muted-foreground">{word.length} / 30</span>
          </div>
        </div>

        <div>
          <label htmlFor="definition" className="mb-1 block text-sm font-medium">
            意味 <span className="text-destructive">*</span>
          </label>
          <textarea
            id="definition"
            rows={3}
            maxLength={200}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="この造語が表す意味を簡潔に説明してください"
            aria-invalid={errors.definition ? "true" : "false"}
            {...register("definition")}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-destructive">
              {errors.definition?.message}
            </span>
            <span className="text-muted-foreground">
              {definition.length} / 200
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="example_sentence"
            className="mb-1 block text-sm font-medium"
          >
            例文（任意）
          </label>
          <input
            id="example_sentence"
            type="text"
            maxLength={200}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="例：倍速視聴しすぎてタイパ疲れした。"
            {...register("example_sentence")}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            使い方がわかると、他のユーザーに伝わりやすくなります
          </p>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            カテゴリ
          </label>
          <select
            id="category"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={errors.category ? "true" : "false"}
            {...register("category")}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.value}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="mt-1 text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
            ニックネーム（任意）
          </label>
          <input
            id="nickname"
            type="text"
            maxLength={30}
            autoComplete="nickname"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="名無し"
            aria-invalid={errors.nickname ? "true" : "false"}
            {...register("nickname")}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-destructive">{errors.nickname?.message}</span>
            <span className="text-muted-foreground">{nickname.length} / 30</span>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? "投稿中..." : "投稿する"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          投稿はログイン不要・匿名で公開されます
        </p>
      </form>
    </Modal>
  );
}
