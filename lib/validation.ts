import { z } from "zod";
import { CATEGORY_VALUES } from "./categories";

export const createWordSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, "造語は1文字以上で入力してください")
    .max(30, "造語は30文字以内で入力してください"),
  definition: z
    .string()
    .trim()
    .min(1, "意味は1文字以上で入力してください")
    .max(200, "意味は200文字以内で入力してください"),
  // 以前は上限が無く、DB の TEXT 列にいくらでも書き込めてしまっていた
  example_sentence: z
    .string()
    .max(200, "例文は200文字以内で入力してください")
    .optional(),
  topic_id: z.string().uuid("お題IDの形式が正しくありません").optional(),
  nickname: z
    .string()
    .max(30, "ニックネームは30文字以内で入力してください")
    .optional(),
  // カテゴリの定義は lib/categories.ts に集約する
  category: z.enum(CATEGORY_VALUES, {
    message: "カテゴリを選択してください",
  }),
});

export type CreateWordInput = z.infer<typeof createWordSchema>;

export const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "コメントは1文字以上で入力してください")
    .max(200, "コメントは200文字以内で入力してください"),
  nickname: z
    .string()
    .max(30, "ニックネームは30文字以内で入力してください")
    .optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
