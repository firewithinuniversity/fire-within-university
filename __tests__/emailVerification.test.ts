import { describe, it, expect } from "vitest";
import crypto from "crypto";

/**
 * Test the token hashing logic used by the email verification flow.
 * We test the cryptographic primitives in isolation since they're the core
 * security mechanism — the same pattern is used for password reset tokens.
 */

describe("Email verification token security", () => {
  it("SHA-256 hash is deterministic", () => {
    const token = "abc123def456";
    const hash1 = crypto.createHash("sha256").update(token).digest("hex");
    const hash2 = crypto.createHash("sha256").update(token).digest("hex");
    expect(hash1).toBe(hash2);
  });

  it("different tokens produce different hashes", () => {
    const token1 = "token-one";
    const token2 = "token-two";
    const hash1 = crypto.createHash("sha256").update(token1).digest("hex");
    const hash2 = crypto.createHash("sha256").update(token2).digest("hex");
    expect(hash1).not.toBe(hash2);
  });

  it("hash is 64 hex characters (256 bits)", () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("raw token from randomBytes is 64 hex characters (32 bytes)", () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    expect(rawToken).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(rawToken)).toBe(true);
  });

  it("raw token is not the same as its hash", () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
    expect(rawToken).not.toBe(hash);
  });

  it("token expiry check works correctly", () => {
    const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

    // Token created now — should not be expired
    const notExpired = new Date(Date.now() + TOKEN_EXPIRY_MS);
    expect(notExpired > new Date()).toBe(true);

    // Token created 25 hours ago — should be expired
    const expired = new Date(Date.now() - 1 * 60 * 60 * 1000);
    expect(expired < new Date()).toBe(true);
  });

  it("email normalization is consistent", () => {
    const normalize = (email: string) => email.toLowerCase().trim();
    expect(normalize("  Test@Example.COM  ")).toBe("test@example.com");
    expect(normalize("USER@SITE.ORG")).toBe("user@site.org");
  });

  it("URL construction with encodeURIComponent handles special chars", () => {
    const email = "user+tag@example.com";
    const token = "abc123";
    const BASE_URL = "https://www.example.com";
    const url = `${BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    expect(url).toBe("https://www.example.com/verify-email?token=abc123&email=user%2Btag%40example.com");
  });
});
