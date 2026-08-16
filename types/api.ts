import { EmojiType, Word } from "./database";

// POST /api/words
export interface CreateWordRequest {
  word: string;            // 1〜30文字
  definition: string;      // 1〜200文字
  example_sentence?: string;
  topic_id?: string;
}
export type CreateWordResponse =
  | { success: true; data: Word }
  | { success: false; error: string }; // 422時: "公序良俗に反する単語・表現が含まれているため登録できません"

// POST /api/words/[id]/vote
export type VoteResponse =
  | { success: true; votes_count: number }
  | { success: false; error: string }; // 429時: "本日はこの造語にすでに投票済みです"

// POST /api/words/[id]/react
export interface ReactRequest {
  emoji_type: EmojiType;
}
export type ReactResponse = { success: true } | { success: false; error: string };

// POST /api/words/[id]/report
export interface ReportRequest {
  reason?: string;
}
export type ReportResponse =
  | { success: true; auto_unpublished: boolean }
  | { success: false; error: string };
