import { test, expect } from "@playwright/test";

test.describe("Hall of Fame", () => {
  test("displays weekly groupings", async ({ page }) => {
    await page.goto("/hall-of-fame");
    await expect(page.getByRole("heading", { name: "殿堂入り" })).toBeVisible();
    await expect(page.getByText("2026-W34")).toBeVisible();
    await expect(page.getByText("2026-W33")).toBeVisible();
  });
});
