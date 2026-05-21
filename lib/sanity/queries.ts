import { client } from "./client";

export type SanityImage = {
  asset: { _ref: string };
  alt?: string;
  hotspot?: { x: number; y: number };
};

export type Author = {
  _id: string;
  name: string;
  role?: string;
  bio?: string;
  photo?: SanityImage;
  slug?: { current: string };
};

export type Category = {
  _id: string;
  title: string;
  slug: { current: string };
};

export type Series = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
};

export type AffiliateProduct = {
  _id: string;
  name: string;
  description: string;
  affiliateUrl: string;
  image?: SanityImage;
  disclosureText?: string;
};

export type PostSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  mainImage?: SanityImage & { alt: string };
  author: Pick<Author, "_id" | "name" | "role" | "photo">;
  category?: Pick<Category, "_id" | "title" | "slug">;
  series?: Pick<Series, "_id" | "title" | "slug">;
};

export type Post = PostSummary & {
  body: unknown[]; // Portable Text blocks — typed by @portabletext/react
  youtubeUrl?: string;
  affiliateProducts?: AffiliateProduct[];
};

const POST_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage { asset, alt, hotspot },
  "author": author-> { _id, name, role, photo },
  "category": category-> { _id, title, slug },
  "series": series-> { _id, title, slug }
`;

async function safeFetch<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sanity] Query failed — using fallback. Set real credentials in .env.local.", err);
    }
    return fallback;
  }
}

export async function getAllPosts(): Promise<PostSummary[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "post"] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`),
    []
  );
}

export async function getAllCategories(): Promise<Pick<Category, "_id" | "title" | "slug">[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "category"] | order(title asc) { _id, title, slug }`
      ),
    []
  );
}

export type FilteredPostsResult = {
  posts: PostSummary[];
  total: number;
};

export async function getFilteredPosts(opts: {
  search?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<FilteredPostsResult> {
  const { search = "", categorySlug = "", page = 1, limit = 9 } = opts;
  const offset = (page - 1) * limit;

  // Build GROQ filter conditions
  const conditions: string[] = [`_type == "post"`];
  if (search) {
    // Match against title or excerpt (case-insensitive via lower())
    conditions.push(
      `(lower(title) match lower("${search.replace(/"/g, "")}*") || lower(coalesce(excerpt, "")) match lower("${search.replace(/"/g, "")}*"))`
    );
  }
  if (categorySlug) {
    conditions.push(`category->slug.current == "${categorySlug.replace(/"/g, "")}"`);
  }

  const filter = conditions.join(" && ");

  type RawResult = { posts: PostSummary[]; total: number };

  const result = await safeFetch<RawResult>(
    () =>
      client.fetch(
        `{
          "posts": *[${filter}] | order(publishedAt desc) [${offset}...${offset + limit}] { ${POST_SUMMARY_FIELDS} },
          "total": count(*[${filter}])
        }`
      ),
    { posts: [], total: 0 }
  );

  return result;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return safeFetch(
    () => client.fetch(
      `*[_type == "post" && slug.current == $slug][0] {
        ${POST_SUMMARY_FIELDS},
        body,
        youtubeUrl,
        "affiliateProducts": affiliateProducts[]-> {
          _id, name, description, affiliateUrl, image, disclosureText
        }
      }`,
      { slug }
    ),
    null
  );
}

export async function getFeaturedPosts(): Promise<PostSummary[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "post"] | order(publishedAt desc) [0..2] { ${POST_SUMMARY_FIELDS} }`),
    []
  );
}

export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "post"] { "slug": slug.current }`),
    []
  );
}

export async function getAllAuthors(): Promise<Author[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "author"] | order(name asc) { _id, name, role, bio, photo, slug }`),
    []
  );
}

export type SeriesSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: SanityImage;
  postCount: number;
};

export async function getAllSeries(): Promise<SeriesSummary[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "series"] | order(title asc) {
          _id, title, slug, description, coverImage,
          "postCount": count(*[_type == "post" && references(^._id)])
        }`
      ),
    []
  );
}

export async function getSeriesBySlug(slug: string): Promise<SeriesSummary | null> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "series" && slug.current == $slug][0] {
          _id, title, slug, description, coverImage,
          "postCount": count(*[_type == "post" && references(^._id)])
        }`,
        { slug }
      ),
    null
  );
}

export async function getPostsBySeries(seriesId: string): Promise<PostSummary[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "post" && series._ref == $seriesId] | order(publishedAt asc) { ${POST_SUMMARY_FIELDS} }`,
        { seriesId }
      ),
    []
  );
}

export async function getRelatedPosts(
  currentSlug: string,
  categoryId?: string
): Promise<PostSummary[]> {
  if (categoryId) {
    const results = await safeFetch(
      () =>
        client.fetch(
          `*[_type == "post" && category._ref == $categoryId && slug.current != $currentSlug] | order(publishedAt desc) [0..2] { ${POST_SUMMARY_FIELDS} }`,
          { categoryId, currentSlug }
        ),
      []
    );
    if (results.length > 0) return results;
  }
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc) [0..2] { ${POST_SUMMARY_FIELDS} }`,
        { currentSlug }
      ),
    []
  );
}

export async function getAllAffiliateProducts(): Promise<AffiliateProduct[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "affiliateProduct"] | order(_createdAt desc) {
          _id, name, description, affiliateUrl, image, disclosureText
        }`
      ),
    []
  );
}

export type SeriesNavigation = {
  seriesTitle: string;
  totalPosts: number;
  currentIndex: number; // 1-based
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
};

export async function getSeriesNavigation(
  seriesId: string,
  currentPostId: string
): Promise<SeriesNavigation | null> {
  return safeFetch(async () => {
    const posts: { _id: string; title: string; slug: { current: string } }[] =
      await client.fetch(
        `*[_type == "post" && series._ref == $seriesId] | order(publishedAt asc) {
          _id, title, slug
        }`,
        { seriesId }
      );

    if (!posts || posts.length === 0) return null;

    const seriesData: { title: string } | null = await client.fetch(
      `*[_type == "series" && _id == $seriesId][0] { title }`,
      { seriesId }
    );

    const idx = posts.findIndex((p) => p._id === currentPostId);
    if (idx === -1) return null;

    return {
      seriesTitle: seriesData?.title ?? "",
      totalPosts: posts.length,
      currentIndex: idx + 1,
      prev: idx > 0 ? { title: posts[idx - 1].title, slug: posts[idx - 1].slug.current } : null,
      next: idx < posts.length - 1 ? { title: posts[idx + 1].title, slug: posts[idx + 1].slug.current } : null,
    };
  }, null);
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "author" && slug.current == $slug][0] { _id, name, role, bio, photo, slug }`,
        { slug }
      ),
    null
  );
}

export async function getPostsByAuthor(authorId: string): Promise<PostSummary[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "post" && author._ref == $authorId] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`,
        { authorId }
      ),
    []
  );
}

export type Testimonial = {
  _id: string;
  name: string;
  location?: string;
  quote: string;
  photo?: SanityImage;
};

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "testimonial" && featured == true] | order(order asc) {
          _id, name, location, quote, photo
        }`
      ),
    []
  );
}

export type CourseSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: SanityImage & { alt?: string };
  instructor?: string;
  lessonCount: number;
  featured?: boolean;
};

export type CourseDetail = CourseSummary & {
  whatYoullLearn?: string[];
  lessons?: {
    _id: string;
    title: string;
    slug: { current: string };
    lessonNumber?: number;
    scripture?: string;
    duration?: string;
  }[];
};

export type LessonDetail = {
  course: {
    title: string;
    slug: { current: string };
    lessons: {
      _id: string;
      title: string;
      slug: { current: string };
      lessonNumber?: number;
    }[];
  };
  currentLesson: {
    _id: string;
    title: string;
    lessonNumber?: number;
    youtubeUrl?: string;
    body?: unknown[];
    downloads?: { label: string; fileUrl: string }[];
    scripture?: string;
    duration?: string;
  };
};

export async function getAllCourses(): Promise<CourseSummary[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "course"] | order(publishedAt desc) {
          _id, title, slug, description, coverImage, instructor, featured,
          "lessonCount": count(lessons)
        }`
      ),
    []
  );
}

export async function getFeaturedCourses(): Promise<CourseSummary[]> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "course" && featured == true] | order(publishedAt desc) {
          _id, title, slug, description, coverImage, instructor, featured,
          "lessonCount": count(lessons)
        }`
      ),
    []
  );
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "course" && slug.current == $slug][0] {
          _id, title, slug, description, coverImage, instructor, featured,
          "lessonCount": count(lessons),
          whatYoullLearn,
          "lessons": lessons[]-> {
            _id, title, slug, lessonNumber, scripture, duration
          }
        }`,
        { slug }
      ),
    null
  );
}

export async function getAllCourseSlugs(): Promise<{ slug: string }[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "course"] { "slug": slug.current }`),
    []
  );
}

export async function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonDetail | null> {
  return safeFetch(
    () =>
      client.fetch(
        `{
          "course": *[_type == "course" && slug.current == $courseSlug][0] {
            title, slug,
            "lessons": lessons[]-> { _id, title, slug, lessonNumber }
          },
          "currentLesson": *[_type == "lesson" && slug.current == $lessonSlug][0] {
            _id, title, lessonNumber, youtubeUrl, body, scripture, duration,
            "downloads": downloads[] { label, fileUrl }
          }
        }`,
        { courseSlug, lessonSlug }
      ),
    null
  );
}
