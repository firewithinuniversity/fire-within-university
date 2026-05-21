/**
 * components/RelatedPosts.tsx — "You might also like" section
 *
 * Shows 2–3 posts from the same category. Falls back to latest posts
 * if no category match exists. Keeps readers in the Word.
 *
 * Server Component — receives posts as props (caller does the fetching).
 */
import Link from "next/link";
import PostCard from "@/components/PostCard";
import type { PostSummary } from "@/lib/sanity/queries";

type Props = {
  posts: PostSummary[];
};

export default function RelatedPosts({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section aria-label="Related posts" className="border-t border-cream/[0.06] pt-10 mt-4">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">
            Keep Reading
          </p>
          <h2 className="font-serif text-2xl font-bold text-cream leading-tight">
            You Might Also Like
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-sm font-semibold text-gold hover:text-gold transition-colors flex-shrink-0 flex items-center gap-1 hover:gap-2 duration-150"
        >
          All posts <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
