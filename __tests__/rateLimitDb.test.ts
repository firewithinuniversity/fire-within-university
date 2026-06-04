import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Shared, hoisted state so the mocked Prisma client can be controlled per-test.
const mockState = vi.hoisted(() => ({
  store: new Map<string, number>(),
  fail: false,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      // Simulates the real fixed-window upsert: create with count=1, else increment.
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { key: string };
        create: { count: number };
        update: { count: { increment: number } };
      }) => {
        if (mockState.fail) throw new Error("db down");
        const key = where.key;
        const next = mockState.store.has(key)
          ? mockState.store.get(key)! + update.count.increment
          : create.count;
        mockState.store.set(key, next);
        return { count: next };
      },
    },
  },
}));

import { checkRateLimitDb } from "@/lib/rateLimitDb";

beforeEach(() => {
  mockState.store.clear();
  mockState.fail = false;
});

describe("checkRateLimitDb", () => {
  it("allows requests up to the limit, then blocks", async () => {
    const opts = { maxRequests: 3, windowMs: 60_000 };
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(true);
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(true);
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(true);
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(false);
  });

  it("tracks distinct keys independently", async () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(true);
    expect(await checkRateLimitDb("login:b@x.com", opts)).toBe(true);
    expect(await checkRateLimitDb("login:a@x.com", opts)).toBe(false);
  });

  it("resets when the fixed window rolls over", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const opts = { maxRequests: 1, windowMs: 60_000 };
    expect(await checkRateLimitDb("ip:1.2.3.4", opts)).toBe(true);
    expect(await checkRateLimitDb("ip:1.2.3.4", opts)).toBe(false);
    // advance into the next window → new composite key → fresh count
    vi.setSystemTime(60_001);
    expect(await checkRateLimitDb("ip:1.2.3.4", opts)).toBe(true);
    vi.useRealTimers();
  });

  it("fails OPEN when the database errors (never locks users out)", async () => {
    mockState.fail = true;
    expect(
      await checkRateLimitDb("login:a@x.com", { maxRequests: 1, windowMs: 60_000 })
    ).toBe(true);
  });
});
