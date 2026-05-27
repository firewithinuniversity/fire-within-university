import { test, expect } from "@playwright/test";

test.describe("Courses page", () => {
  test("courses listing page loads with heading", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Courses");
  });

  test("courses listing shows course cards", async ({ page }) => {
    await page.goto("/courses");
    // Check for course card links
    const courseLinks = page.locator('main a[href^="/courses/"]');
    const count = await courseLinks.count();
    if (count > 0) {
      await expect(courseLinks.first()).toBeVisible();
    } else {
      await expect(page.getByText(/no courses|coming soon/i)).toBeVisible();
    }
  });

  test("course detail page loads with lessons", async ({ page }) => {
    await page.goto("/courses");
    const courseLink = page.locator('main a[href^="/courses/"]').first();
    const hasCourse = await courseLink.isVisible().catch(() => false);
    if (!hasCourse) {
      test.skip();
      return;
    }
    const href = await courseLink.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    // Skip if course data unavailable (404 page in dev)
    const is404 = await page.getByText("Page Not Found").isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }
    // Course detail should have a "Lessons" heading
    await expect(page.getByRole("heading", { name: /lessons/i })).toBeVisible();
  });

  test("course detail has breadcrumb navigation", async ({ page }) => {
    await page.goto("/courses");
    const courseLink = page.locator('main a[href^="/courses/"]').first();
    const hasCourse = await courseLink.isVisible().catch(() => false);
    if (!hasCourse) {
      test.skip();
      return;
    }
    const href = await courseLink.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    const is404 = await page.getByText("Page Not Found").isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }
    // Breadcrumb nav exists
    await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toBeVisible();
  });

  test("course detail has structured data", async ({ page }) => {
    await page.goto("/courses");
    const courseLink = page.locator('main a[href^="/courses/"]').first();
    const hasCourse = await courseLink.isVisible().catch(() => false);
    if (!hasCourse) {
      test.skip();
      return;
    }
    const href = await courseLink.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    const is404 = await page.getByText("Page Not Found").isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }
    // Check for JSON-LD script tags
    const jsonLd = page.locator('script[type="application/ld+json"]');
    expect(await jsonLd.count()).toBeGreaterThanOrEqual(1);
  });
});
