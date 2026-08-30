import { test, expect } from "@playwright/test";

test.describe("ダミーUIの表示制御", () => {
  test("「使い方を見る」ボタンをクリックすると近日公開ページへ遷移する", async ({
    page,
  }) => {
    await page.goto("/");
    const guideButton = page.getByRole("button", { name: "使い方を見る" });
    await expect(guideButton).toBeVisible();
    await guideButton.click();
    await expect(page).toHaveURL("/coming-soon");
    await expect(page.getByText("近日公開").first()).toBeVisible();
  });

  test("ハンバーガーメニューアイコンをクリックすると近日公開ページへ遷移する", async ({
    page,
  }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "メニュー" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page).toHaveURL("/coming-soon");
  });

  test("ログインボタンは表示されていない", async ({ page }) => {
    await page.goto("/");
    const loginButton = page.getByRole("button", { name: "ログイン" });
    await expect(loginButton).toHaveCount(0);
  });
});
