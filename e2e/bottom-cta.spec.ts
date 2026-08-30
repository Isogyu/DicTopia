import { test, expect } from "@playwright/test";

test.describe("Bottom CTA", () => {
  test("フッター直前の CTA から造語投稿モーダルを開ける", async ({
    page,
  }) => {
    await page.goto("/");
    const ctaButton = page
      .getByRole("button", { name: "新語を追加する" })
      .last();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await expect(page.getByRole("dialog", { name: "新しい造語を作る" })).toBeVisible();
  });
});
