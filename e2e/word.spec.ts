import { test, expect } from "@playwright/test";

test.describe("Word detail page", () => {
  test("renders title, definition, comments, and JSON-LD", async ({ page }) => {
    await page.goto("/");
    await page.getByText("サブスク墓場").first().click();
    await expect(page).toHaveURL(/\/word\//);
    await expect(page.locator("h1").first()).toHaveText("サブスク墓場");
    await expect(page.getByText("契約したまま使わなくなった")).toBeVisible();
    await expect(page.getByRole("heading", { name: "コメント" })).toBeVisible();
    await expect(
      page.locator('script[type="application/ld+json"]')
    ).toHaveCount(1);
  });
});
