import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodaysScripture, SCRIPTURES } from "@/lib/scripture";

afterEach(() => {
  vi.useRealTimers();
});

describe("SCRIPTURES", () => {
  it("has at least 30 entries", () => {
    expect(SCRIPTURES.length).toBeGreaterThanOrEqual(30);
  });

  it("each entry has required fields", () => {
    for (const s of SCRIPTURES) {
      expect(s.reference).toBeTruthy();
      expect(s.text).toBeTruthy();
      expect(s.bibleGatewayUrl).toMatch(/^https:\/\/www\.biblegateway\.com/);
    }
  });

  it("has no duplicate references", () => {
    const refs = SCRIPTURES.map((s) => s.reference);
    expect(new Set(refs).size).toBe(refs.length);
  });
});

describe("getTodaysScripture", () => {
  it("returns a valid scripture object", () => {
    const s = getTodaysScripture();
    expect(s).toHaveProperty("reference");
    expect(s).toHaveProperty("text");
    expect(s).toHaveProperty("bibleGatewayUrl");
  });

  it("returns the same scripture on the same day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T08:00:00Z"));
    const morning = getTodaysScripture();

    vi.setSystemTime(new Date("2025-06-15T22:00:00Z"));
    const evening = getTodaysScripture();

    expect(morning.reference).toBe(evening.reference);
  });

  it("returns a different scripture on a different day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const day1 = getTodaysScripture();

    vi.setSystemTime(new Date("2025-06-16T12:00:00Z"));
    const day2 = getTodaysScripture();

    expect(day1.reference).not.toBe(day2.reference);
  });

  it("wraps around after cycling through all scriptures", () => {
    vi.useFakeTimers();
    // Day 1 and day (1 + SCRIPTURES.length) should be the same
    vi.setSystemTime(new Date("2025-01-02T12:00:00Z"));
    const first = getTodaysScripture();

    const wrappedDate = new Date("2025-01-02T12:00:00Z");
    wrappedDate.setDate(wrappedDate.getDate() + SCRIPTURES.length);
    vi.setSystemTime(wrappedDate);
    const wrapped = getTodaysScripture();

    expect(first.reference).toBe(wrapped.reference);
  });
});
