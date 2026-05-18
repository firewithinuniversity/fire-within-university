/**
 * lib/sanity/queries.ts — All GROQ queries
 *
 * GROQ (Graph-Relational Object Queries) is Sanity's query language.
 * Keeping all queries in one file means:
 * - Easy to audit what data is being fetched
 * - Change a field name? Fix it in one place.
 * - Consistent data shapes across the app
 *
 * GROQ BASICS:
 *   *[_type == "post"]          — all documents of type "post"
 *   *[_type == "post"][0..9]    — first 10 posts
 *   { title, slug, author-> }  — projection: pick these fields
 *   author->                    — dereference: follow the reference and return the author doc
 *   | order(publishedAt desc)   — sort by date, newest first
 *   [slug.current == $slug][0]  — filter by slug, take first result
 *
 * TypeScript types: we define the shape of each query result so our
 * components get full type safety when they use the data.
 */
import { client } from "./client";

// ─── TypeScript types for query results ──────────────────────────────────────

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

// Post summary — used on blog index cards (less data = faster load)
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

// Full post — used on single post page (includes body and affiliate products)
export type Post = PostSummary & {
  body: unknown[]; // Portable Text blocks — typed by @portabletext/react
  youtubeUrl?: string;
  affiliateProducts?: AffiliateProduct[];
};

// ─── Queries ─────────────────────────────────────────────────────────────────

// Reusable projection fragment for the summary fields (avoids repeating this in every query)
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

/**
 * Get all published posts, newest first.
 * Used on the blog index page.
 */
// Helper: returns a fallback value if Sanity is unreachable (e.g. placeholder credentials in dev)
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

/**
 * Get a single post by slug.
 * Used on individual article/sermon pages.
 */
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

/**
 * Get the 3 most recent posts for the homepage featured section.
 */
export async function getFeaturedPosts(): Promise<PostSummary[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "post"] | order(publishedAt desc) [0..2] { ${POST_SUMMARY_FIELDS} }`),
    []
  );
}

/**
 * Get all post slugs — used by Next.js generateStaticParams to pre-render
 * all blog pages at build time (static generation = fastest possible load).
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "post"] { "slug": slug.current }`),
    []
  );
}

/**
 * Get all authors — used on the About page.
 */
export async function getAllAuthors(): Promise<Author[]> {
  return safeFetch(
    () => client.fetch(`*[_type == "author"] | order(name asc) { _id, name, role, bio, photo, slug }`),
    []
  );
}

// ─── Reading time ─────────────────────────────────────────────────────────────
// PostSummary intentionally omits body for performance. Full post includes body
// so reading time is calculated from it in the single post page.

// ─── Series ───────────────────────────────────────────────────────────────────

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

// ─── Related posts ────────────────────────────────────────────────────────────

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
  // Fallback: just get latest posts (excluding current)
  return safeFetch(
    () =>
      client.fetch(
        `*[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc) [0..2] { ${POST_SUMMARY_FIELDS} }`,
        { currentSlug }
      ),
    []
  );
}

// ─── Resources (Affiliate Products) ──────────────────────────────────────────

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

// ─── Authors ─────────────────────────────────────────────────────────────────

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

// ─── Testimonial ──────────────────────────────────────────────────────────────

export type Testimonial = {
  _id: string;
  name: string;
  location?: string;
  quote: string;
  photo?: SanityImage;
};

/**
 * Get featured testimonials for the homepage, sorted by display order.
 * Only returns testimonials with featured: true.
 */
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
