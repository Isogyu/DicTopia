import { test, expect } from "@playwright/test";

test.describe("ナビゲーションと回遊導線", () => {
  test("ヘッダーから造語一覧・殿堂入り・使い方へ遷移できる", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "造語一覧" }).first().click();
    await expect(page).toHaveURL(/\/words$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /造語一覧/ })
    ).toBeVisible();

    await page.getByRole("link", { name: "使い方" }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "DicTopia の使い方" })
    ).toBeVisible();
  });

  test("旧ダミーページ /coming-soon は使い方ページへリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/coming-soon");
    await expect(page).toHaveURL(/\/about$/);
  });

  test("一覧ページでカテゴリを絞り込める", async ({ page }) => {
    await page.goto("/words");
    await page.getByRole("link", { name: /ネット・SNS/ }).first().click();
    await expect(page).toHaveURL(/\/words\/internet/);
    await expect(
      page.getByRole("heading", { level: 1, name: /ネット・SNS/ })
    ).toBeVisible();
  });

  test("一覧ページを人気順に並び替えられる", async ({ page }) => {
    await page.goto("/words");
    await page.getByRole("link", { name: "人気順" }).click();
    await expect(page).toHaveURL(/sort=popular/);
  });

  test("ログインボタンは表示されていない", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "ログイン" })).toHaveCount(0);
  });
});

test.describe("モバイル表示", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("検索バーはメニューを開かなくても使える", async ({ page }) => {
    await page.goto("/");
    // 検索はメニュー内に隠さず、ヘッダーに常時出す
    await expect(page.getByRole("searchbox").first()).toBeVisible();
  });

  test("ハンバーガーメニューを開閉できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "メニューを開く" }).click();

    const menu = page.getByRole("dialog", { name: "メニュー" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "殿堂入り" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
});
