import { test, expect } from "@playwright/test";

test.describe("Hall of Fame", () => {
  test("投票数の多い順にランキングが並ぶ", async ({ page }) => {
    await page.goto("/hall-of-fame");
    await expect(
      page.getByRole("heading", { level: 1, name: "殿堂入りの造語" })
    ).toBeVisible();

    const items = page.locator("ol > li");
    await expect(items.first()).toBeVisible();

    // 1 位のカードに順位バッジが付いている
    await expect(page.getByLabel("1位")).toBeVisible();
  });
});
