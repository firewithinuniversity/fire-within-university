import { test, expect } from "@playwright/test";

test.describe("Cookie banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage so banner appears fresh each test
    await page.context().clearCookies();
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("fwu_cookie_consent"));
    // Reload after clearing localStorage so the component reads clean state
    await page.reload();
  });

  test("cookie banner is visible on first visit", async ({ page }) => {
    const banner = page.getByRole("region", { name: /cookie consent/i });
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Both action buttons should be present
    await expect(banner.getByLabel(/accept cookies/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(banner.getByLabel(/decline cookies/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("clicking Accept hides the banner", async ({ page }) => {
    const banner = page.getByRole("region", { name: /cookie consent/i });
    await expect(banner).toBeVisible({ timeout: 5000 });

    await banner.getByLabel(/accept cookies/i).click();
    await expect(banner).not.toBeVisible();
  });

  test("clicking Decline hides the banner", async ({ page }) => {
    const banner = page.getByRole("region", { name: /cookie consent/i });
    await expect(banner).toBeVisible({ timeout: 5000 });

    await banner.getByLabel(/decline cookies/i).click();
    await expect(banner).not.toBeVisible();
  });

  test("banner does not reappear after accepting", async ({ page }) => {
    const banner = page.getByRole("region", { name: /cookie consent/i });
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Accept cookies
    await banner.getByLabel(/accept cookies/i).click();
    await expect(banner).not.toBeVisible();

    // Navigate to another page and back
    await page.goto("/about");
    await page.goto("/");

    // Banner should stay hidden because localStorage remembers the choice
    await expect(
      page.getByRole("region", { name: /cookie consent/i })
    ).not.toBeVisible();
  });
});
