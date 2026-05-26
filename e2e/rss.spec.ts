import { test, expect } from "@playwright/test";

test.describe("RSS feed", () => {
  test("serves valid RSS XML at /feed.xml", async ({ request }) => {
    const response = await request.get("/feed.xml");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/rss+xml");

    const body = await response.text();
    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain("<rss version");
    expect(body).toContain("<channel>");
    expect(body).toContain("Fire Within University");
  });

  test("RSS feed is discoverable from homepage", async ({ page }) => {
    await page.goto("/");

    // Check for <link rel="alternate" type="application/rss+xml"> in <head>
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("href", /feed\.xml/);
  });
});
