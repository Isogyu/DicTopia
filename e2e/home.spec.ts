import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("主要セクションが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DicTopia/);
    await expect(page.getByText("あなたの造語が、").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "新着造語" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "人気ランキング" })
    ).toBeVisible();
    await expect(page.getByText("あなたの言葉が、未来の辞書に。")).toBeVisible();
  });

  test("各セクションに「もっと見る」導線がある", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /すべての新着を見る/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /ランキングをすべて見る/ })
    ).toBeVisible();
  });

  test("人気ランキングから造語詳細へ遷移できる", async ({ page }) => {
    await page.goto("/");
    const wordLink = page.getByRole("link", { name: "サブスク墓場" }).first();
    await expect(wordLink).toBeVisible();
    await wordLink.click();
    await expect(page).toHaveURL(/\/word\//);
    await expect(page.locator("h1").first()).toHaveText("サブスク墓場");
  });

  test("OGP のメタタグが出力されている", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('meta[property="og:title"]')
    ).toHaveCount(1);
    await expect(
      page.locator('meta[property="og:image"]')
    ).toHaveCount(1);
    await expect(
      page.locator('meta[name="twitter:card"]')
    ).toHaveCount(1);
  });
});

test.describe("SEO 基盤", () => {
  test("robots.txt が sitemap を指している", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Sitemap:");
  });

  test("sitemap.xml が主要 URL を含む", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("/words");
    expect(xml).toContain("/hall-of-fame");
  });
});
