import { getOpenAIClient } from "./client";

export async function moderateText(text: string): Promise<boolean> {
  const client = getOpenAIClient();
  const response = await client.moderations.create({ input: text });
  return response.results.some((result) => result.flagged);
}
