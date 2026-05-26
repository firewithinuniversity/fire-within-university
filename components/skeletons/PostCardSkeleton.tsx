/**
 * Reusable skeleton placeholder for a PostCard.
 * Matches PostCard's layout: cover image, category tag, title, excerpt, author row.
 */
export default function PostCardSkeleton() {
  return (
    <div className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden flex flex-col animate-pulse">
      {/* Cover image */}
      <div className="aspect-video bg-cream/10" />

      {/* Card body */}
      <div className="p-5 space-y-3 flex flex-col flex-grow">
        {/* Category tag */}
        <div className="h-3 w-20 bg-cream/10 rounded-full" />
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-cream/10 rounded" />
          <div className="h-5 w-4/5 bg-cream/10 rounded" />
        </div>
        {/* Excerpt */}
        <div className="space-y-1.5 pt-1 flex-grow">
          <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
          <div className="h-3.5 w-11/12 bg-cream/[0.06] rounded" />
          <div className="h-3.5 w-3/4 bg-cream/[0.06] rounded" />
        </div>
        {/* Author + date row */}
        <div className="flex items-center gap-2 pt-2 border-t border-cream/[0.04]">
          <div className="w-9 h-9 rounded-full bg-cream/10 shrink-0" />
          <div className="space-y-1.5 flex-grow">
            <div className="h-3 w-24 bg-cream/10 rounded" />
            <div className="h-2.5 w-32 bg-cream/[0.06] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
