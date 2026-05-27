import { test, expect } from "@playwright/test";

test.describe("Newsletter signup", () => {
  test("newsletter form is visible on homepage", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: /newsletter signup/i });
    await expect(form).toBeVisible({ timeout: 5000 });

    await expect(form.getByPlaceholder("Your email address")).toBeVisible({
      timeout: 5000,
    });
    await expect(form.getByRole("button", { name: "Subscribe" })).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows validation error for empty submission", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: /newsletter signup/i });
    await expect(form).toBeVisible({ timeout: 5000 });

    // Submit without entering an email
    await form.getByRole("button", { name: "Subscribe" }).click();

    // The component validates client-side (noValidate on form) and shows an alert
    const error = form.getByRole("alert");
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toHaveText("Please enter a valid email address.");
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: /newsletter signup/i });
    await expect(form).toBeVisible({ timeout: 5000 });

    // Enter an invalid email (no @ symbol)
    await form.getByPlaceholder("Your email address").fill("not-an-email");
    await form.getByRole("button", { name: "Subscribe" }).click();

    const error = form.getByRole("alert");
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toHaveText("Please enter a valid email address.");
  });

  test("email input has proper aria attributes", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: /newsletter signup/i });
    await expect(form).toBeVisible({ timeout: 5000 });

    const emailInput = form.getByPlaceholder("Your email address");
    await expect(emailInput).toHaveAttribute("aria-label", "Email address");
    await expect(emailInput).toHaveAttribute(
      "aria-describedby",
      "email-signup-hint"
    );

    // The hint element referenced by aria-describedby should exist
    const hint = page.locator("#email-signup-hint");
    await expect(hint).toBeAttached();
  });
});
