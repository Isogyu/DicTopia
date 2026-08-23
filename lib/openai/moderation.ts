import { getOpenAIClient } from "./client";

export async function moderateText(text: string): Promise<boolean> {
  if (process.env.SKIP_MODERATION === "true") {
    return false;
  }

  const client = getOpenAIClient();
  const response = await client.moderations.create({ input: text });
  return response.results.some((result) => result.flagged);
}
