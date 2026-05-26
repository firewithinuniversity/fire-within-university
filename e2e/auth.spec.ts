import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("sign in button opens auth modal", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Wait for session hydration — AuthDropdown shows skeleton during loading
    const signInBtn = page.getByRole("button", { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    // Auth modal should appear (dynamically imported)
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });
  });

  test("auth modal has sign in and register tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const signInBtn = page.getByRole("button", { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Should have tab buttons — they have role="tab" in the modal
    await expect(dialog.getByRole("tab", { name: "Sign In" })).toBeVisible();
    await expect(dialog.getByRole("tab", { name: "Create Account" })).toBeVisible();
  });

  test("sign in form has required email field", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const signInBtn = page.getByRole("button", { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const emailInput = dialog.getByLabel("Email");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("required");
  });

  test("auth modal closes with close button", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const signInBtn = page.getByRole("button", { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    await dialog.getByLabel("Close").click();
    await expect(dialog).not.toBeVisible();
  });

  test("profile page redirects when not authenticated", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).not.toContain("/profile");
  });
});
