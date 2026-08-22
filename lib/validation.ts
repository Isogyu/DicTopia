import { z } from "zod";

export const createWordSchema = z.object({
  word: z
    .string()
    .min(1, "造語は1文字以上で入力してください")
    .max(30, "造語は30文字以内で入力してください"),
  definition: z
    .string()
    .min(1, "意味は1文字以上で入力してください")
    .max(200, "意味は200文字以内で入力してください"),
  example_sentence: z.string().optional(),
  topic_id: z.string().uuid("お題IDの形式が正しくありません").optional(),
  nickname: z.string().max(30, "ニックネームは30文字以内で入力してください").optional(),
  category: z.enum([
    "ライフスタイル",
    "感情・感性",
    "仕事・ビジネス",
    "ネット・SNS",
    "恋愛・人間関係",
    "その他",
  ], { message: "カテゴリを選択してください" }).optional(),
});

export type CreateWordInput = z.infer<typeof createWordSchema>;

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "コメントは1文字以上で入力してください")
    .max(200, "コメントは200文字以内で入力してください"),
  nickname: z.string().max(30, "ニックネームは30文字以内で入力してください").optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
