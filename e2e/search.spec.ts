import { test, expect } from "@playwright/test";

test.describe("Global search", () => {
  test("search input is visible in desktop navbar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Search input should be visible in the navbar
    const input = page.getByRole("combobox", { name: "Search" });
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test("mobile search expands on icon click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Click the mobile search button
    await page.locator('button[aria-label="Search"]').click();

    // Search input should now be visible
    const inputs = page.getByRole("combobox", { name: "Search" });
    await expect(inputs.first()).toBeVisible({ timeout: 5000 });
  });

  test("dropdown closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const input = page.getByRole("combobox", { name: "Search" });
    await input.fill("test query");

    // Wait for dropdown to appear (either results or no-results)
    await page.waitForTimeout(500);

    await page.keyboard.press("Escape");

    // Listbox should not be visible after Escape
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("shows clean state before typing", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const input = page.getByRole("combobox", { name: "Search" });
    await expect(input).toBeVisible({ timeout: 5000 });

    // No dropdown should be visible before typing
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("performs search and shows results or empty state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const input = page.getByRole("combobox", { name: "Search" });
    await input.fill("Jesus");

    // Wait for debounce (250ms) + API response — either results appear or empty state
    const results = page.getByRole("listbox");
    const emptyState = page.locator("text=/No results for/i").first();
    await expect(results.or(emptyState)).toBeVisible({ timeout: 8000 });
  });
});
