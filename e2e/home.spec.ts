import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays the title, active topic, and leaderboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DicTopia/);
    await expect(page.getByText("今週のお題").first()).toBeVisible();
    await expect(page.getByText("今週のバズ造語 Top 10")).toBeVisible();
    await expect(page.getByText("新着造語")).toBeVisible();
  });

  test("navigates to a word detail page from the leaderboard", async ({
    page,
  }) => {
    await page.goto("/");
    const wordLink = page.getByText("サブスク墓場").first();
    await expect(wordLink).toBeVisible();
    await wordLink.click();
    await expect(page).toHaveURL(/\/word\//);
    await expect(page.getByRole("heading", { name: "サブスク墓場" })).toBeVisible();
  });
});
