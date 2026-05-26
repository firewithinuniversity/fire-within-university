import { test, expect } from "@playwright/test";

test.describe("Global search", () => {
  test("opens search modal from desktop navbar button", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Click the search button in the navbar
    await page.getByLabel("Search (Ctrl+K)").click();

    const dialog = page.getByRole("dialog", { name: /search/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const input = dialog.getByRole("combobox", { name: "Search" });
    await expect(input).toBeFocused();
  });

  test("opens search modal from mobile navbar button", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Mobile search button has aria-label="Search" (no Ctrl+K suffix)
    await page.locator('button[aria-label="Search"]').click();

    const dialog = page.getByRole("dialog", { name: /search/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test("closes search modal with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await page.getByLabel("Search (Ctrl+K)").click();

    const dialog = page.getByRole("dialog", { name: /search/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("shows hint for short queries", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await page.getByLabel("Search (Ctrl+K)").click();

    const dialog = page.getByRole("dialog", { name: /search/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText("Type at least 2 characters")).toBeVisible();
  });

  test("performs search and shows results or empty state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await page.getByLabel("Search (Ctrl+K)").click();

    const dialog = page.getByRole("dialog", { name: /search/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const input = dialog.getByRole("combobox", { name: "Search" });
    await input.fill("Jesus");

    // Wait for debounce (250ms) + API response — either results appear or empty state
    const results = dialog.getByRole("listbox");
    const emptyState = dialog.locator("text=/No results found/i").first();
    await expect(results.or(emptyState)).toBeVisible({ timeout: 8000 });
  });
});
