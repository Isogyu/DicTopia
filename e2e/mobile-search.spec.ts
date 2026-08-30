import { test, expect } from "@playwright/test";

test.describe("モバイル検索", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("ハンバーガーメニュー内で造語を検索して遷移できる", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "メニューを開く" }).click();
    await expect(page.getByLabel("造語を検索")).toBeVisible();

    await page.getByLabel("造語を検索").fill("サブスク");
    const result = page
      .getByRole("link")
      .filter({ hasText: /サブスク/ })
      .first();
    await expect(result).toBeVisible();

    await result.click();
    await expect(page).toHaveURL(/\/word\//);
  });
});
