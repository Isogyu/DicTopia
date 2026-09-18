import { test, expect } from "@playwright/test";

test.describe("Word detail page", () => {
  test("語・意味・パンくず・構造化データが表示される", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "サブスク墓場" }).first().click();
    await expect(page).toHaveURL(/\/word\//);

    await expect(page.locator("h1").first()).toHaveText("サブスク墓場");
    await expect(page.getByText("契約したまま使わなくなった")).toBeVisible();

    // パンくずからカテゴリ一覧へ戻れる
    await expect(
      page.getByRole("navigation", { name: "パンくずリスト" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /コメント/ })
    ).toBeVisible();

    // DefinedTerm + BreadcrumbList + サイト全体の WebSite
    const jsonLd = page.locator('script[type="application/ld+json"]');
    expect(await jsonLd.count()).toBeGreaterThanOrEqual(3);
  });

  test("説明文とタイトルが造語ごとに設定される", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "サブスク墓場" }).first().click();

    await expect(page).toHaveTitle(/サブスク墓場/);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      /サブスク墓場/
    );
  });

  test("同カテゴリの関連造語が表示される", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "サブスク墓場" }).first().click();
    await expect(
      page.getByRole("heading", { name: /の人気の造語/ })
    ).toBeVisible();
  });
});
