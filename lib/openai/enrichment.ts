import { getOpenAIClient } from "./client";

export interface EnrichmentResult {
  tags: string[];
  summary: string;
}

export async function enrichWord(
  word: string,
  definition: string,
  exampleSentence?: string
): Promise<EnrichmentResult> {
  const client = getOpenAIClient();
  const parts = [word, definition, exampleSentence]
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  const content = parts.join("\n\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたは造語のSEOタグと要約を生成するアシスタントです。入力された造語・意味・例文から、JSON形式で `ai_context_tags`（3〜5個の日本語タグ、文字列配列）と `ai_search_summary`（1文の分析的コメント、120文字以内の文字列）を出力してください。",
      },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty enrichment response");
  }

  const parsed = JSON.parse(raw) as { ai_context_tags?: unknown; ai_search_summary?: unknown };
  const tags = Array.isArray(parsed.ai_context_tags)
    ? parsed.ai_context_tags.filter((t): t is string => typeof t === "string")
    : [];
  const summary = typeof parsed.ai_search_summary === "string" ? parsed.ai_search_summary : "";

  return { tags, summary };
}
