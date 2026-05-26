import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test("contact form loads with all fields", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  });

  test("contact form shows validation on empty submit", async ({ page }) => {
    await page.goto("/contact");

    // The form fields should be required (HTML5 validation)
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toHaveAttribute("required");

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("required");
  });
});
