import { describe, it, expect } from "vitest";
import { sanitizeSearchTerm, ilikeFilter } from "@/lib/supabase/filters";

describe("sanitizeSearchTerm", () => {
  it("通常の日本語はそのまま通す", () => {
    expect(sanitizeSearchTerm("サブスク墓場")).toBe("サブスク墓場");
  });

  it("前後の空白を除去する", () => {
    expect(sanitizeSearchTerm("  疲れ  ")).toBe("疲れ");
  });

  it("PostgREST のフィルタ式を壊す予約文字を除去する", () => {
    // カンマ 1 文字で or() のフィルタ木が壊れていた回帰を防ぐ
    for (const char of [",", "(", ")", ".", '"', "\\", ":", "*"]) {
      expect(sanitizeSearchTerm(char)).toBe("");
    }
  });

  it("フィルタ注入を狙う文字列から予約文字を落とす", () => {
    const injected = sanitizeSearchTerm(
      'x%,is_published.eq.false,word.ilike."%'
    );
    expect(injected).not.toContain(",");
    expect(injected).not.toContain("(");
    expect(injected).not.toContain('"');
    expect(injected).not.toContain(".");
  });

  it("LIKE のワイルドカードを無効化する", () => {
    expect(sanitizeSearchTerm("%")).toBe("");
    expect(sanitizeSearchTerm("_")).toBe("");
    expect(sanitizeSearchTerm("あ%い")).toBe("あ い");
  });

  it("連続する空白を 1 つにまとめる", () => {
    expect(sanitizeSearchTerm("あ   い")).toBe("あ い");
  });
});

describe("ilikeFilter", () => {
  it("値をダブルクォートで囲んだフィルタ式を作る", () => {
    expect(ilikeFilter("word", "疲れ")).toBe('word.ilike."%疲れ%"');
  });
});
