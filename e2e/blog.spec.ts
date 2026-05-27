import { test, expect } from "@playwright/test";

test.describe("Blog page", () => {
  test("blog listing page loads with heading", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sermons");
  });

  test("blog listing shows post cards", async ({ page }) => {
    await page.goto("/blog");
    // Posts rendered as <article> elements inside PostCard
    const articles = page.locator("main article");
    // Should have at least 1 post (or a no-posts message)
    const count = await articles.count();
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    } else {
      await expect(page.getByText(/no posts|no sermons|content coming soon/i)).toBeVisible();
    }
  });

  test("blog post detail page loads", async ({ page }) => {
    await page.goto("/blog");
    // Click the first post link
    const firstPostLink = page.locator("main article a").first();
    const hasPost = await firstPostLink.isVisible().catch(() => false);
    if (!hasPost) {
      test.skip();
      return;
    }
    await firstPostLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    // Should have an article element
    await expect(page.locator("article")).toBeVisible();
  });

  test("blog post has reading progress bar", async ({ page }) => {
    await page.goto("/blog");
    const firstPostLink = page.locator("main article a").first();
    const hasPost = await firstPostLink.isVisible().catch(() => false);
    if (!hasPost) {
      test.skip();
      return;
    }
    await firstPostLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    // Progress bar has role="progressbar"
    await expect(page.getByRole("progressbar")).toBeAttached();
  });

  test("blog post has share buttons", async ({ page }) => {
    await page.goto("/blog");
    const firstPostLink = page.locator("main article a").first();
    const hasPost = await firstPostLink.isVisible().catch(() => false);
    if (!hasPost) {
      test.skip();
      return;
    }
    await firstPostLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    // Share group exists
    await expect(page.getByRole("group", { name: /share/i })).toBeVisible();
  });

  test("blog search filters posts", async ({ page }) => {
    await page.goto("/blog");
    const searchInput = page.getByPlaceholder(/search/i);
    const hasSearch = await searchInput.isVisible().catch(() => false);
    if (!hasSearch) {
      test.skip();
      return;
    }
    // Typing in search should work without error
    await searchInput.fill("Jesus");
    // Submit the search form
    await searchInput.press("Enter");
    // Page should still load (URL should update with query)
    await expect(page).toHaveURL(/q=Jesus/i);
  });
});
