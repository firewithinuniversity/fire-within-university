import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import PageHeader from "@/components/PageHeader";
import VideoCard from "@/components/VideoCard";
import EmailSignup from "@/components/EmailSignup";
import SectionReveal from "@/components/SectionReveal";
import { getAllCategories, getFilteredPosts, getLatestVideos } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { canonicalUrl } from "@/lib/metadata";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface BlogIndexPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

const BLOG_DESCRIPTION =
  "Browse all sermons, articles, and devotionals from Fire Within University.";

export async function generateMetadata({ searchParams }: BlogIndexPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const isFiltered = Boolean(params.q?.trim()) || Boolean(params.category);

  const title = page > 1 ? `Sermons & Articles — Page ${page}` : "Sermons & Articles";
  // Paginated views self-canonicalize so page 2+ stays crawlable; search/filter
  // views are kept out of the index to avoid thin/duplicate content (audit SEO #3).
  const canonical = page > 1 ? canonicalUrl(`/blog?page=${page}`) : canonicalUrl("/blog");

  return {
    title,
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    ...(isFiltered ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description: BLOG_DESCRIPTION, url: canonical },
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const categorySlug = params.category ?? "";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // Run in parallel: categories, filtered posts, unfiltered total, and videos
  const [categories, { posts, total }, { total: totalUnfiltered }, latestVideos] = await Promise.all([
    getAllCategories(),
    getFilteredPosts({
      search: searchQuery,
      categorySlug,
      page: currentPage,
      limit: POSTS_PER_PAGE,
    }),
    // Cheap count-only query (no post data) to check if site has any posts at all
    getFilteredPosts({ page: 1, limit: 1 }),
    getLatestVideos(),
  ]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const hasActiveFilter = searchQuery !== "" || categorySlug !== "";
  const siteHasPosts = totalUnfiltered > 0;

  // Build a URL helper that preserves other params
  function buildHref(overrides: { q?: string; category?: string; page?: number }) {
    const p = new URLSearchParams();
    const q = overrides.q !== undefined ? overrides.q : searchQuery;
    const cat = overrides.category !== undefined ? overrides.category : categorySlug;
    const pg = overrides.page !== undefined ? overrides.page : currentPage;
    if (q) p.set("q", q);
    if (cat) p.set("category", cat);
    if (pg > 1) p.set("page", String(pg));
    const qs = p.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Teaching Library"
        title="Sermons & Articles"
        subtitle="Biblical teaching, devotionals, and resources to strengthen your faith and deepen your walk with Jesus."
      />
      <div className="max-w-6xl mx-auto px-4">

      {/* ── Search + Category filters ── */}
      <div className="mb-10 space-y-5">
        {/* Search input — uses a GET form so it's pure server-side */}
        <form method="GET" action="/blog" className="relative max-w-lg mx-auto">
          {/* Preserve category when submitting search */}
          {categorySlug && (
            <input type="hidden" name="category" value={categorySlug} />
          )}
          <label htmlFor="blog-search" className="sr-only">
            Search posts
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-cream/50" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="blog-search"
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search sermons and articles…"
              className="w-full rounded-full border border-cream/10 bg-cream/[0.03] pl-11 pr-4 py-3 text-cream placeholder-cream/60 text-sm focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors"
            />
            {searchQuery && (
              <Link
                href={buildHref({ q: "", page: 1 })}
                className="absolute inset-y-0 right-4 flex items-center text-cream/50 hover:text-cream/60 transition-colors text-xs"
                aria-label="Clear search"
              >
                ✕
              </Link>
            )}
          </div>
        </form>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href={buildHref({ category: "", page: 1 })}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                categorySlug === ""
                  ? "border-gold text-gold bg-gold/[0.08]"
                  : "border-cream/20 text-cream/50 hover:border-cream/40 hover:text-cream/70"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => {
              const isActive = categorySlug === cat.slug.current;
              return (
                <Link
                  key={cat._id}
                  href={buildHref({ category: isActive ? "" : cat.slug.current, page: 1 })}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                    isActive
                      ? "border-gold text-gold bg-gold/[0.08]"
                      : "border-cream/20 text-cream/50 hover:border-cream/40 hover:text-cream/70"
                  }`}
                >
                  {cat.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Featured Videos ── */}
      {latestVideos.length > 0 && !hasActiveFilter && currentPage === 1 && (
        <div className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-serif text-2xl font-bold text-cream">Latest Videos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestVideos.slice(0, 3).map((video, i) => (
              <SectionReveal key={video._id} delay={i * 100} distance={20}>
                <VideoCard
                  title={video.title}
                  youtubeUrl={video.youtubeUrl}
                  thumbnailUrl={
                    video.thumbnail
                      ? imageUrlFor(video.thumbnail).width(640).height(360).url()
                      : undefined
                  }
                  category={video.category}
                  speaker={video.speaker}
                  scripture={video.scripture}
                  duration={video.duration}
                />
              </SectionReveal>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination — disabled controls render as non-focusable spans so
              keyboard users can't activate them (audit a11y #5). */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {currentPage <= 1 ? (
                <span aria-disabled="true" className="px-4 py-2 text-sm rounded-lg border border-cream/[0.06] text-cream/40 select-none">
                  ← Previous
                </span>
              ) : (
                <Link
                  href={buildHref({ page: currentPage - 1 })}
                  rel="prev"
                  className="px-4 py-2 text-sm rounded-lg border border-cream/10 text-cream/60 hover:bg-cream/[0.04] hover:border-cream/20 transition-colors"
                >
                  ← Previous
                </Link>
              )}

              <span className="text-sm text-cream/50 px-2">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage >= totalPages ? (
                <span aria-disabled="true" className="px-4 py-2 text-sm rounded-lg border border-cream/[0.06] text-cream/40 select-none">
                  Next →
                </span>
              ) : (
                <Link
                  href={buildHref({ page: currentPage + 1 })}
                  rel="next"
                  className="px-4 py-2 text-sm rounded-lg border border-cream/10 text-cream/60 hover:bg-cream/[0.04] hover:border-cream/20 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : !siteHasPosts && !hasActiveFilter ? (
        /* ── No posts at all: Content Coming Soon ── */
        <div className="max-w-lg mx-auto text-center py-14 space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold/[0.08] flex items-center justify-center mx-auto">
            <svg width="22" height="34" viewBox="0 0 32 48" className="text-gold/60" fill="currentColor" aria-hidden="true">
              <rect x="13" y="0" width="6" height="48" rx="3" />
              <rect x="0" y="14" width="32" height="6" rx="3" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-3xl font-bold text-cream">Content Coming Soon</p>
            <p className="text-cream/50 leading-relaxed">
              Be the first to know when we publish. Drop your email below and we will
              notify you the moment the first sermon goes live.
            </p>
          </div>

          <div className="pt-2">
            <EmailSignup variant="inline" location="blog" />
          </div>

          <p className="text-cream/50 text-sm italic pt-4 border-t border-cream/[0.06]">
            &ldquo;Blessed are those who hunger and thirst for righteousness, for they will be filled.&rdquo;
            {" "}
            <a
              href="https://www.biblegateway.com/passage/?search=Matthew+5%3A6&version=NIV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light not-italic font-semibold text-xs transition-colors"
            >
              — Matthew 5:6
            </a>
          </p>
        </div>
      ) : (
        /* ── Search / filter returned no results ── */
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-full bg-cream/[0.04] flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cream/50">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="font-serif text-2xl font-bold text-cream">No results found</p>
          <p className="text-cream/50 text-sm leading-relaxed">
            {searchQuery && categorySlug
              ? `No posts matched "${searchQuery}" in this category.`
              : searchQuery
              ? `No posts matched "${searchQuery}".`
              : "No posts in this category yet."}
          </p>
          <Link
            href="/blog"
            className="inline-block mt-2 text-sm text-gold hover:text-gold/70 transition-colors underline underline-offset-2"
          >
            Clear filters
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
