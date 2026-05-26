import PostCardSkeleton from "./PostCardSkeleton";

/**
 * Skeleton fallback for the RelatedPosts Suspense boundary.
 * Shows the "You Might Also Like" header + 3 ghost post cards.
 */
export default function RelatedPostsSkeleton() {
  return (
    <section
      aria-label="Loading related posts"
      className="border-t border-cream/[0.06] pt-10 mt-4"
    >
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <div className="h-3 w-24 bg-cream/10 rounded-full mb-2 animate-pulse" />
          <div className="h-7 w-48 bg-cream/10 rounded animate-pulse" />
        </div>
        <div className="h-4 w-20 bg-cream/[0.06] rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
