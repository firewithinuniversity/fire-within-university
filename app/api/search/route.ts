import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

type SearchResult = {
  type: "post" | "course" | "lesson";
  title: string;
  slug: string;
  description?: string;
  /** For lessons, the parent course slug */
  courseSlug?: string;
};

export async function GET(request: Request) {
  const ip = getIpFromRequest(request);
  if (!checkRateLimit(`search:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Sanitize: limit length, use GROQ params for injection safety
  const term = q.slice(0, 100);

  try {
    const data = await client.fetch<{
      posts: { title: string; slug: { current: string }; excerpt?: string }[];
      courses: { title: string; slug: { current: string }; description?: string }[];
      lessons: {
        title: string;
        slug: { current: string };
        courseSlug?: string;
        courseTitle?: string;
      }[];
    }>(
      `{
        "posts": *[_type == "post" && (lower(title) match lower($searchTerm) || lower(coalesce(excerpt, "")) match lower($searchTerm))] | order(publishedAt desc) [0...5] {
          title, slug, excerpt
        },
        "courses": *[_type == "course" && (lower(title) match lower($searchTerm) || lower(coalesce(description, "")) match lower($searchTerm))] | order(publishedAt desc) [0...5] {
          title, slug, description
        },
        "lessons": *[_type == "lesson" && (lower(title) match lower($searchTerm) || lower(coalesce(scripture, "")) match lower($searchTerm))] [0...5] {
          title, slug,
          "courseSlug": *[_type == "course" && references(^._id)][0].slug.current,
          "courseTitle": *[_type == "course" && references(^._id)][0].title
        }
      }`,
      { searchTerm: `${term}*` }
    );

    const results: SearchResult[] = [];

    for (const post of data.posts ?? []) {
      results.push({
        type: "post",
        title: post.title,
        slug: post.slug.current,
        description: post.excerpt,
      });
    }

    for (const course of data.courses ?? []) {
      results.push({
        type: "course",
        title: course.title,
        slug: course.slug.current,
        description: course.description,
      });
    }

    for (const lesson of data.lessons ?? []) {
      if (lesson.courseSlug) {
        results.push({
          type: "lesson",
          title: lesson.title,
          slug: lesson.slug.current,
          courseSlug: lesson.courseSlug,
          description: lesson.courseTitle ? `From: ${lesson.courseTitle}` : undefined,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[Search] Query error:", err);
    return NextResponse.json({ results: [] });
  }
}
