import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays all main sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DicTopia/);
    await expect(page.getByText("あなたの造語が、").first()).toBeVisible();
    await expect(page.getByText("新着造語").first()).toBeVisible();
    await expect(page.getByText("人気ランキング").first()).toBeVisible();
    await expect(page.getByText("最新のコメント").first()).toBeVisible();
    await expect(page.getByText("あなたの言葉が、未来の辞書に。")).toBeVisible();
  });

  test("navigates to a word detail page from popular ranking", async ({
    page,
  }) => {
    await page.goto("/");
    const wordLink = page.getByText("サブスク墓場").first();
    await expect(wordLink).toBeVisible();
    await wordLink.click();
    await expect(page).toHaveURL(/\/word\//);
    await expect(page.locator("h1").first()).toHaveText("サブスク墓場");
  });
});
