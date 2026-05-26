import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env utilities", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getNextAuthSecret", () => {
    it("returns the secret when valid (32+ chars)", async () => {
      process.env.NEXTAUTH_SECRET = "a".repeat(48);
      const { getNextAuthSecret } = await import("@/lib/env");
      expect(getNextAuthSecret()).toBe("a".repeat(48));
    });

    it("throws when secret is too short", async () => {
      process.env.NEXTAUTH_SECRET = "short";
      const { getNextAuthSecret } = await import("@/lib/env");
      expect(() => getNextAuthSecret()).toThrow("at least 32 characters");
    });

    it("throws when secret is missing", async () => {
      delete process.env.NEXTAUTH_SECRET;
      const { getNextAuthSecret } = await import("@/lib/env");
      expect(() => getNextAuthSecret()).toThrow("Missing required server environment variable");
    });
  });

  describe("getResendApiKey", () => {
    it("returns the key when set", async () => {
      process.env.RESEND_API_KEY = "re_test_abc123";
      const { getResendApiKey } = await import("@/lib/env");
      expect(getResendApiKey()).toBe("re_test_abc123");
    });

    it("throws when missing", async () => {
      delete process.env.RESEND_API_KEY;
      const { getResendApiKey } = await import("@/lib/env");
      expect(() => getResendApiKey()).toThrow("RESEND_API_KEY");
    });
  });

  describe("getStripeSecretKey", () => {
    it("returns the key when set", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
      const { getStripeSecretKey } = await import("@/lib/env");
      expect(getStripeSecretKey()).toBe("sk_test_xxx");
    });

    it("throws when missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const { getStripeSecretKey } = await import("@/lib/env");
      expect(() => getStripeSecretKey()).toThrow("STRIPE_SECRET_KEY");
    });
  });

  describe("GA_ID", () => {
    it("defaults to empty string when not set", async () => {
      delete process.env.NEXT_PUBLIC_GA_ID;
      const { GA_ID } = await import("@/lib/env");
      expect(GA_ID).toBe("");
    });

    it("returns the value when set", async () => {
      process.env.NEXT_PUBLIC_GA_ID = "G-ABC123";
      const { GA_ID } = await import("@/lib/env");
      expect(GA_ID).toBe("G-ABC123");
    });
  });
});
