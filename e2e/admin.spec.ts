import { test, expect } from "@playwright/test";

test.describe("Admin security boundaries", () => {
  test("visiting /admin without a session redirects to homepage", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).not.toContain("/admin");
  });

  test("/admin/contacts redirects to homepage without session", async ({ page }) => {
    await page.goto("/admin/contacts");
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).not.toContain("/admin");
  });

  test("/admin/users redirects to homepage without session", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).not.toContain("/admin");
  });

  test("/admin/analytics redirects to homepage without session", async ({ page }) => {
    await page.goto("/admin/analytics");
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).not.toContain("/admin");
  });
});

test.describe("Admin API security boundaries", () => {
  test("GET /api/admin/contacts returns 401 or 403 without session", async ({ request }) => {
    const response = await request.get("/api/admin/contacts");
    expect([401, 403]).toContain(response.status());
  });

  test("GET /api/admin/analytics returns 401 or 403 without session", async ({ request }) => {
    const response = await request.get("/api/admin/analytics");
    expect([401, 403]).toContain(response.status());
  });

  test("GET /api/admin/users returns 401 or 403 without session", async ({ request }) => {
    const response = await request.get("/api/admin/users");
    expect([401, 403]).toContain(response.status());
  });

  test("GET /api/admin/audit-logs returns 401 or 403 without session", async ({ request }) => {
    const response = await request.get("/api/admin/audit-logs");
    expect([401, 403]).toContain(response.status());
  });
});
