import { test, expect } from "@playwright/test";

test.describe("Word detail page", () => {
  test("renders title, definition, and JSON-LD", async ({ page }) => {
    await page.goto("/");
    await page.getByText("タイパ疲れ").first().click();
    await expect(page).toHaveURL(/\/word\//);
    await expect(
      page.getByRole("heading", { name: "タイパ疲れ" })
    ).toBeVisible();
    await expect(page.getByText("タイムパフォーマンス")).toBeVisible();
    await expect(
      page.locator('script[type="application/ld+json"]')
    ).toHaveCount(1);
  });
});
