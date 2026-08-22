"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { createWordSchema, type CreateWordInput } from "@/lib/validation";
import { FEATURE_WEEKLY_TOPIC } from "@/lib/config";
import type { Topic, Word } from "@/types/database";
import type { CreateWordResponse } from "@/types/api";

interface SubmissionModalProps {
  activeTopic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (word: Word) => void;
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

  const defaultValues: CreateWordInput = {
    word: initialWord,
    definition: "",
    example_sentence: "",
    topic_id: FEATURE_WEEKLY_TOPIC ? activeTopic?.id : undefined,
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWordInput>({
    resolver: zodResolver(createWordSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset({
        word: initialWord,
        definition: "",
        example_sentence: "",
        topic_id: FEATURE_WEEKLY_TOPIC ? activeTopic?.id : undefined,
      });
      setServerError(null);
    }
  }, [open, activeTopic, initialWord, reset]);

  const word = watch("word") ?? "";
  const definition = watch("definition") ?? "";
  const example = watch("example_sentence") ?? "";

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
        onSubmitted(result.data);
        onOpenChange(false);
        return;
      }

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    } catch {
      setServerError("投稿に失敗しました。時間をおいて再度お試しください");
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm sm:items-center sm:pt-0"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-title"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="submission-title" className="text-xl font-bold">
            新しい造語を作る
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-2xl text-muted-foreground hover:text-foreground"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {FEATURE_WEEKLY_TOPIC && activeTopic && (
          <p className="mb-4 text-sm text-muted-foreground">
            お題：{activeTopic.title}
          </p>
        )}

        {serverError && (
          <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="word" className="mb-1 block text-sm font-medium">
              造語
            </label>
            <input
              id="word"
              type="text"
              maxLength={30}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例：タイパ疲れ"
              aria-invalid={errors.word ? "true" : "false"}
              {...register("word")}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{errors.word?.message}</span>
              <span>{word.length} / 30</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="definition"
              className="mb-1 block text-sm font-medium"
            >
              意味
            </label>
            <textarea
              id="definition"
              rows={4}
              maxLength={200}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="この造語が表す意味を簡潔に説明してください"
              aria-invalid={errors.definition ? "true" : "false"}
              {...register("definition")}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{errors.definition?.message}</span>
              <span>{definition.length} / 200</span>
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例：倍速視聴しすぎてタイパ疲れした。"
              {...register("example_sentence")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {example.length} 文字
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿する"}
          </Button>
        </form>
      </div>
    </div>
  );
}
