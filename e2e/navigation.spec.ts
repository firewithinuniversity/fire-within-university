import { test, expect } from "@playwright/test";

test.describe("Site navigation", () => {
  test("homepage loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fire Within University/);
  });

  test("navbar links are visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Check desktop nav links (use first() since mobile nav also has them)
    await expect(page.getByRole("link", { name: "Sermons" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Courses" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "About" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Give" }).first()).toBeVisible();
  });

  test("mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const menu = page.locator("#mobile-menu");
    await expect(menu).toHaveAttribute("aria-hidden", "true");

    await page.getByLabel("Open menu").click();
    await expect(menu).toHaveAttribute("aria-hidden", "false");

    await page.getByLabel("Close menu").click();
    await expect(menu).toHaveAttribute("aria-hidden", "true");
  });

  test("navigating to blog page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sermons" }).first().click();
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sermons");
  });

  test("navigating to courses page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Courses" }).first().click();
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Courses");
  });

  test("navigating to about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
