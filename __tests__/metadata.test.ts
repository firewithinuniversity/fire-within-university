import { describe, it, expect, vi } from "vitest";

// Mock env before importing the module
vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://test.example.com");

const { canonicalUrl, organizationJsonLd, websiteJsonLd, articleJsonLd, courseJsonLd, breadcrumbJsonLd, seriesJsonLd } = await import("@/lib/metadata");

describe("canonicalUrl", () => {
  it("returns base URL for root path", () => {
    expect(canonicalUrl("/")).toBe("https://test.example.com/");
  });

  it("returns base URL when no path given", () => {
    expect(canonicalUrl()).toBe("https://test.example.com/");
  });

  it("prepends slash if missing", () => {
    expect(canonicalUrl("about")).toBe("https://test.example.com/about");
  });

  it("preserves leading slash", () => {
    expect(canonicalUrl("/courses/my-course")).toBe(
      "https://test.example.com/courses/my-course"
    );
  });

  it("handles nested paths", () => {
    expect(canonicalUrl("/courses/slug/lessons/lesson-1")).toBe(
      "https://test.example.com/courses/slug/lessons/lesson-1"
    );
  });
});

describe("organizationJsonLd", () => {
  it("returns valid Organization schema", () => {
    const result = organizationJsonLd();
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("Fire Within University");
    expect(result.url).toBe("https://test.example.com");
    expect(result.logo).toContain("logo.png");
  });
});

describe("websiteJsonLd", () => {
  it("returns valid WebSite schema with search action", () => {
    const result = websiteJsonLd();
    expect(result["@type"]).toBe("WebSite");
    expect(result.potentialAction["@type"]).toBe("SearchAction");
    expect(result.potentialAction.target.urlTemplate).toContain("/blog?q=");
  });
});

describe("articleJsonLd", () => {
  it("returns valid Article schema", () => {
    const result = articleJsonLd({
      title: "Test Post",
      description: "A test article",
      url: "https://test.example.com/blog/test",
      publishedAt: "2024-01-01",
      authorName: "John Doe",
    });
    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("Test Post");
    expect(result.author.name).toBe("John Doe");
    expect(result.publisher.name).toBe("Fire Within University");
  });

  it("includes image when provided", () => {
    const result = articleJsonLd({
      title: "Test",
      url: "https://example.com",
      publishedAt: "2024-01-01",
      authorName: "Author",
      imageUrl: "https://example.com/img.jpg",
    });
    expect(result.image).toBe("https://example.com/img.jpg");
  });

  it("omits image when not provided", () => {
    const result = articleJsonLd({
      title: "Test",
      url: "https://example.com",
      publishedAt: "2024-01-01",
      authorName: "Author",
    });
    expect(result).not.toHaveProperty("image");
  });
});

describe("courseJsonLd", () => {
  it("returns valid Course schema", () => {
    const result = courseJsonLd({
      title: "My Course",
      description: "A great course",
      url: "https://test.example.com/courses/my-course",
      instructor: "Dr. Smith",
    });
    expect(result["@type"]).toBe("Course");
    expect(result.name).toBe("My Course");
    expect(result.hasCourseInstance.instructor!.name).toBe("Dr. Smith");
    expect(result.provider.name).toBe("Fire Within University");
    expect(result.offers.price).toBe("0");
  });

  it("omits instructor when not provided", () => {
    const result = courseJsonLd({
      title: "My Course",
      url: "https://test.example.com/courses/my-course",
    });
    expect(result.hasCourseInstance).not.toHaveProperty("instructor");
  });
});

describe("breadcrumbJsonLd", () => {
  it("returns valid BreadcrumbList with correct positions", () => {
    const result = breadcrumbJsonLd([
      { name: "Home", url: "https://test.example.com/" },
      { name: "Courses", url: "https://test.example.com/courses" },
      { name: "My Course", url: "https://test.example.com/courses/mine" },
    ]);
    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[2].position).toBe(3);
    expect(result.itemListElement[1].name).toBe("Courses");
  });

  it("handles single item", () => {
    const result = breadcrumbJsonLd([
      { name: "Home", url: "https://test.example.com/" },
    ]);
    expect(result.itemListElement).toHaveLength(1);
  });
});

describe("seriesJsonLd", () => {
  it("returns valid ItemList schema with correct positions", () => {
    const result = seriesJsonLd({
      title: "Walking in Faith",
      description: "A 3-part series on faith",
      url: "https://test.example.com/series/walking-in-faith",
      items: [
        { name: "Part 1: Beginning", url: "https://test.example.com/blog/part-1" },
        { name: "Part 2: Growing", url: "https://test.example.com/blog/part-2" },
        { name: "Part 3: Finishing", url: "https://test.example.com/blog/part-3" },
      ],
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("ItemList");
    expect(result.name).toBe("Walking in Faith");
    expect(result.description).toBe("A 3-part series on faith");
    expect(result.url).toBe("https://test.example.com/series/walking-in-faith");
    expect(result.numberOfItems).toBe(3);
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[0].name).toBe("Part 1: Beginning");
    expect(result.itemListElement[2].position).toBe(3);
  });

  it("handles empty items array", () => {
    const result = seriesJsonLd({
      title: "Empty Series",
      url: "https://test.example.com/series/empty",
      items: [],
    });
    expect(result.numberOfItems).toBe(0);
    expect(result.itemListElement).toHaveLength(0);
  });

  it("omits description when not provided", () => {
    const result = seriesJsonLd({
      title: "No Description Series",
      url: "https://test.example.com/series/no-desc",
      items: [{ name: "Post 1", url: "https://test.example.com/blog/post-1" }],
    });
    expect(result.description).toBeUndefined();
    expect(result.numberOfItems).toBe(1);
  });
});
