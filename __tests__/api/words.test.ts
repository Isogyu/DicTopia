import { randomUUID } from "crypto";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/words/route";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Word } from "@/types/database";

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

let topicId: string;

beforeAll(async () => {
  server.listen({ onUnhandledRequest: "bypass" });
  const { data: topic } = await admin
    .from("topics")
    .select("id")
    .eq("is_active", true)
    .single();
  topicId = (topic as { id: string })?.id ?? "";
});

afterEach(async () => {
  server.resetHandlers();
  await admin.from("words").delete().ilike("word", "test-%");
  await admin.from("comments").delete().ilike("body", "test-%");
});

afterAll(() => server.close());

async function makeRequest(body: Record<string, unknown>) {
  return POST(
    new NextRequest("http://localhost:3000/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

async function cleanupWord(id: string) {
  await admin.from("comments").delete().eq("word_id", id);
  await admin.from("words").delete().eq("id", id);
}

describe("POST /api/words", () => {
  it("#1 creates a published word and enriches SEO tags", async () => {
    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "テスト用の造語です",
      category: "その他",
      topic_id: topicId,
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: Word };
    expect(body.success).toBe(true);
    expect(body.data.is_published).toBe(true);
    expect(body.data.category).toBe("その他");

    // 非同期エンリッチメントを待機
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { data: updated } = await admin
      .from("words")
      .select("ai_context_tags, ai_search_summary")
      .eq("id", body.data.id)
      .single();

    const enriched = updated as {
      ai_context_tags: string[];
      ai_search_summary: string;
    };
    expect(enriched.ai_context_tags).toEqual(["test"]);
    expect(enriched.ai_search_summary).toBe("テスト用の要約");

    await cleanupWord(body.data.id);
  });

  it("#2 rejects moderation flagged input", async () => {
    server.use(
      http.post("https://api.openai.com/v1/moderations", () =>
        HttpResponse.json({ results: [{ flagged: true }] })
      )
    );

    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "不適切な定義です",
      category: "その他",
    });

    expect(res.status).toBe(422);
    const text = await res.text();
    expect(text).toContain("公序良俗");
  });

  it("#3 rejects word over 30 characters", async () => {
    const res = await makeRequest({
      word: "a".repeat(31),
      definition: "定義です",
      category: "その他",
    });

    expect(res.status).toBe(400);
  });

  it("#4 rejects definition over 200 characters", async () => {
    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "あ".repeat(201),
      category: "その他",
    });

    expect(res.status).toBe(400);
  });

  it("#5 rejects non-existent topic_id", async () => {
    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "テスト",
      category: "その他",
      topic_id: randomUUID(),
    });

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("お題");
  });

  it("#6 returns 201 even if SEO enrichment fails", async () => {
    server.use(
      http.post("https://api.openai.com/v1/chat/completions", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "SEO失敗を確認する造語です",
      category: "その他",
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: Word };
    expect(body.success).toBe(true);
    await cleanupWord(body.data.id);
  });

  it("#7 returns 500 when moderation API fails", async () => {
    server.use(
      http.post("https://api.openai.com/v1/moderations", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const res = await makeRequest({
      word: `test-${randomUUID().slice(0, 8)}`,
      definition: "モデレーション失敗を確認する造語です",
      category: "その他",
    });

    expect(res.status).toBe(500);
  });
});
