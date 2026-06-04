import { describe, it, expect, afterEach } from "vitest";
import {
  getBaseUrl,
  PRODUCTION_BASE_URL,
  EMAIL_FROM_NOREPLY,
  EMAIL_CONTACT,
  EMAIL_HELLO,
} from "@/lib/constants";

describe("getBaseUrl", () => {
  const original = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = original;
  });

  it("uses the env override when set", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    expect(getBaseUrl()).toBe("https://example.com");
  });

  it("falls back to the production URL when unset", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(getBaseUrl()).toBe(PRODUCTION_BASE_URL);
  });

  it("falls back to the production URL when set to an empty string", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "";
    expect(getBaseUrl()).toBe(PRODUCTION_BASE_URL);
  });

  it("never falls back to localhost (audit H7 — broke Stripe redirects)", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(getBaseUrl()).not.toContain("localhost");
  });
});

describe("ministry email + URL constants", () => {
  it("production URL points at the real domain over https", () => {
    expect(PRODUCTION_BASE_URL).toMatch(/^https:\/\/.*firewithinuniversity\.com$/);
  });

  it("all sender/contact emails are on the verified domain", () => {
    for (const addr of [EMAIL_FROM_NOREPLY, EMAIL_CONTACT, EMAIL_HELLO]) {
      expect(addr).toMatch(/@firewithinuniversity\.com$/);
    }
  });

  it("public contact address is hello@", () => {
    expect(EMAIL_HELLO).toBe("hello@firewithinuniversity.com");
  });
});
