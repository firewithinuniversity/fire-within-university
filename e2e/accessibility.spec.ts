import { test, expect } from "@playwright/test";

test.describe("Accessibility basics", () => {
  test("skip-to-content link exists and targets main", async ({ page }) => {
    await page.goto("/");

    // The skip link should exist (sr-only, visible on focus)
    const skipLink = page.getByRole("link", { name: /skip to/i });
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    // Main content target should exist
    const main = page.locator("#main-content");
    await expect(main).toBeAttached();
  });

  test("page has lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.getAttribute("html", "lang");
    expect(lang).toBe("en");
  });

  test("images have alt text on homepage", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // alt should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("nav landmarks exist", async ({ page }) => {
    await page.goto("/");

    // Should have a main navigation landmark
    const nav = page.getByRole("navigation", { name: /main/i });
    await expect(nav).toBeVisible();
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
  });

  test("heading hierarchy starts with h1", async ({ page }) => {
    await page.goto("/blog");

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("cookie banner has proper ARIA", async ({ page }) => {
    // Use a fresh context to ensure cookie banner appears
    const context = await page.context().browser()!.newContext();
    const freshPage = await context.newPage();
    await freshPage.goto("/");

    const banner = freshPage.getByRole("region", { name: /cookie/i });
    // Banner should be visible on first visit (no stored consent)
    if (await banner.isVisible()) {
      await expect(banner.getByLabel(/accept/i)).toBeVisible();
      await expect(banner.getByLabel(/decline/i)).toBeVisible();
    }

    await context.close();
  });
});
