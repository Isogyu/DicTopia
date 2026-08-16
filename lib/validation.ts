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
});

export type CreateWordInput = z.infer<typeof createWordSchema>;
