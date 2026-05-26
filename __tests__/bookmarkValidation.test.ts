import { describe, it, expect } from "vitest";

/**
 * Test the slug validation regex and type validation used by the bookmarks API.
 * These are extracted from the route to test in isolation.
 */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/;
const VALID_TYPES = ["course", "lesson"] as const;

describe("Bookmark slug validation", () => {
  it("accepts simple lowercase slugs", () => {
    expect(SLUG_RE.test("intro-to-faith")).toBe(true);
    expect(SLUG_RE.test("lesson-1")).toBe(true);
    expect(SLUG_RE.test("a1")).toBe(true);
  });

  it("accepts all-lowercase with hyphens", () => {
    expect(SLUG_RE.test("the-gospel-of-john-chapter-3")).toBe(true);
  });

  it("rejects slugs starting with hyphen", () => {
    expect(SLUG_RE.test("-starts-with-dash")).toBe(false);
  });

  it("rejects slugs ending with hyphen", () => {
    expect(SLUG_RE.test("ends-with-dash-")).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(SLUG_RE.test("Hello-World")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(SLUG_RE.test("hello world")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(SLUG_RE.test("hello_world")).toBe(false);
    expect(SLUG_RE.test("test@slug")).toBe(false);
    expect(SLUG_RE.test("slug!")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(SLUG_RE.test("")).toBe(false);
  });

  it("rejects single character", () => {
    // Min match is 2 chars (start + end, no middle)
    expect(SLUG_RE.test("a")).toBe(false);
  });

  it("accepts exactly 200 character slug", () => {
    const slug = "a" + "b".repeat(198) + "c";
    expect(slug.length).toBe(200);
    expect(SLUG_RE.test(slug)).toBe(true);
  });

  it("rejects 201+ character slug", () => {
    const slug = "a" + "b".repeat(199) + "c";
    expect(slug.length).toBe(201);
    expect(SLUG_RE.test(slug)).toBe(false);
  });
});

describe("Bookmark type validation", () => {
  it("accepts 'course' type", () => {
    expect(VALID_TYPES.includes("course")).toBe(true);
  });

  it("accepts 'lesson' type", () => {
    expect(VALID_TYPES.includes("lesson")).toBe(true);
  });

  it("rejects invalid types", () => {
    expect(VALID_TYPES.includes("post" as never)).toBe(false);
    expect(VALID_TYPES.includes("" as never)).toBe(false);
    expect(VALID_TYPES.includes("COURSE" as never)).toBe(false);
  });
});
