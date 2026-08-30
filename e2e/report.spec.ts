import { test, expect } from "@playwright/test";

test.describe("通報 UX", () => {
  test("通報モーダルに4つの理由選択肢があり、詳細入力が表示される", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByText("サブスク墓場").first().click();
    await expect(page).toHaveURL(/\/word\//);

    const reportButton = page
      .getByRole("button", { name: "通報する" })
      .first();
    await expect(reportButton).toBeVisible();
    await reportButton.click();

    const dialog = page.getByRole("dialog", { name: "通報" });
    await expect(dialog).toBeVisible();

    for (const reason of ["スパム", "暴言", "不適切", "その他"]) {
      await expect(dialog.getByLabel(reason)).toBeVisible();
    }

    await dialog.getByLabel("その他").check();
    await expect(dialog.getByLabel("詳細（任意）")).toBeVisible();
  });
});
