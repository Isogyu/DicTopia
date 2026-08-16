export type EmojiType = "fire" | "laugh" | "cry" | "clap";

export interface Topic {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  is_active: boolean;
  week_code: string;
}

export interface Word {
  id: string;
  created_at: string;
  word: string;
  definition: string;
  example_sentence: string | null;
  topic_id: string | null;
  votes_count: number;
  reports_count: number;
  is_published: boolean;
  ai_context_tags: string[];
  ai_search_summary: string | null;
}

export interface Vote {
  id: string;
  created_at: string;
  word_id: string;
  voter_hash: string;
}

export interface Reaction {
  id: string;
  created_at: string;
  word_id: string;
  emoji_type: EmojiType;
}

export interface Report {
  id: string;
  created_at: string;
  word_id: string;
  reason: string | null;
  reporter_hash: string;
}
