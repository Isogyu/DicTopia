import { randomUUID } from "crypto";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/words/route";
import { createAdminClient } from "@/lib/supabase/admin";

const server = setupServer(
  http.post("https://api.openai.com/v1/moderations", () =>
    HttpResponse.json({ results: [{ flagged: false }] })
  ),
  http.post("https://api.openai.com/v1/chat/completions", () =>
    HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              ai_context_tags: ["test"],
              ai_search_summary: "テスト用の要約",
            }),
          },
        },
      ],
    })
  )
);

const admin = createAdminClient();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

describe("POST /api/words", () => {
  it("returns 201 and creates a published word", async () => {
    const id = randomUUID();
    const res = await POST(
      new NextRequest("http://localhost:3000/api/words", {
        method: "POST",
        body: JSON.stringify({
          word: `test-${id.slice(0, 8)}`,
          definition: "テスト用の造語です",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: { id: string; word: string } };
    expect(body.success).toBe(true);
    expect(body.data.word).toContain("test-");

    await admin.from("words").delete().eq("id", body.data.id);
  });

  it("returns 400 for too long word", async () => {
    const res = await POST(
      new NextRequest("http://localhost:3000/api/words", {
        method: "POST",
        body: JSON.stringify({
          word: "a".repeat(31),
          definition: "定義です",
        }),
      })
    );

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBeTruthy();
  });

  it("returns 422 when moderation flags the input", async () => {
    server.use(
      http.post("https://api.openai.com/v1/moderations", () =>
        HttpResponse.json({ results: [{ flagged: true }] })
      )
    );

    const res = await POST(
      new NextRequest("http://localhost:3000/api/words", {
        method: "POST",
        body: JSON.stringify({
          word: "悪質ワード",
          definition: "不適切な定義です",
        }),
      })
    );

    expect(res.status).toBe(422);
  });
});
