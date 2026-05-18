/**
 * app/(site)/blog/page.tsx — Blog / Sermon index
 *
 * Shows all posts in a grid, newest first.
 * Server Component — fetches posts at build time (static generation).
 *
 * PATTERN — generateMetadata:
 * This exported async function lets each page set its own SEO metadata.
 * It runs on the server before the page renders and returns a Metadata object.
 * The root layout sets defaults; page-level metadata overrides specific fields.
 */
import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import EmailSignup from "@/components/EmailSignup";
import { getAllPosts } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Sermons & Articles",
  description:
    "Browse all sermons, articles, and devotionals from Fire Within University.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Page header */}
      <div className="text-center mb-14 space-y-4">
        {/* Cross accent */}
        <div className="flex justify-center" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" className="text-gold/40">
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown">
          Sermons &amp; Articles
        </h1>
        <p className="text-brown/60 max-w-xl mx-auto text-lg">
          Biblical teaching, devotionals, and resources to strengthen your faith
          and deepen your walk with Jesus.
        </p>
      </div>

      {/* Post grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="max-w-lg mx-auto text-center py-14 space-y-6">
          {/* Cross icon in soft orange circle — matches the About page value cards */}
          <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto">
            <svg width="22" height="34" viewBox="0 0 32 48" className="text-orange/60" fill="currentColor" aria-hidden="true">
              <rect x="13" y="0" width="6" height="48" rx="3" />
              <rect x="0" y="14" width="32" height="6" rx="3" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-serif text-3xl font-bold text-brown">Content Coming Soon</p>
            <p className="text-brown/60 leading-relaxed">
              Be the first to know when we publish. Drop your email below and we will
              notify you the moment the first sermon goes live.
            </p>
          </div>

          {/* Warm email capture — same handler as the homepage hero */}
          <div className="pt-2">
            <EmailSignup variant="inline" />
          </div>

          {/* Encouraging scripture */}
          <p className="text-brown/45 text-sm italic pt-4 border-t border-brown/10">
            &ldquo;Blessed are those who hunger and thirst for righteousness, for they will be filled.&rdquo;
            {" "}
            <a
              href="https://www.biblegateway.com/passage/?search=Matthew+5%3A6&version=NIV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:text-orange-hover not-italic font-semibold text-xs transition-colors"
            >
              — Matthew 5:6
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
