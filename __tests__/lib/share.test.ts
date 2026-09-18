import { describe, it, expect } from "vitest";
import { buildShareText, buildShareUrl, buildTweetIntent } from "@/lib/share";
import { CATEGORIES, categoryBySlug, categorySlug } from "@/lib/categories";

const target = {
  id: "11111111-2222-3333-4444-555555555555",
  word: "サブスク墓場",
  definition: "契約したまま使わなくなったサブスクサービスの集合体",
};

describe("buildShareText", () => {
  it("造語と意味の両方を含む", () => {
    const text = buildShareText(target);
    expect(text).toContain("サブスク墓場");
    expect(text).toContain("契約したまま");
    expect(text).toContain("#DicTopia");
  });

  it("長い意味は省略する", () => {
    const text = buildShareText({ ...target, definition: "あ".repeat(100) });
    expect(text).toContain("…");
    expect(text.length).toBeLessThan(120);
  });
});

describe("buildShareUrl", () => {
  it("絶対 URL を返す", () => {
    expect(buildShareUrl(target)).toMatch(/^https?:\/\/.+\/word\/1111/);
  });
});

describe("buildTweetIntent", () => {
  it("text と url をエンコードして渡す", () => {
    const intent = buildTweetIntent(target);
    expect(intent.startsWith("https://twitter.com/intent/tweet?")).toBe(true);
    const params = new URL(intent).searchParams;
    expect(params.get("text")).toContain("サブスク墓場");
    expect(params.get("url")).toContain("/word/");
  });
});

describe("categories", () => {
  it("スラッグはすべて ASCII で一意", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z]+$/));
  });

  it("スラッグと値を相互に解決できる", () => {
    CATEGORIES.forEach((category) => {
      expect(categoryBySlug(category.slug)?.value).toBe(category.value);
      expect(categorySlug(category.value)).toBe(category.slug);
    });
  });

  it("未知の値は「その他」へ倒す", () => {
    expect(categorySlug("存在しない")).toBe("other");
    expect(categoryBySlug("nope")).toBeUndefined();
  });
});
