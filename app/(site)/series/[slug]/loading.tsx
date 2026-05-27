import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

export default function SeriesDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 animate-pulse">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8">
        <div className="h-3.5 w-28 bg-cream/10 rounded" />
        <div className="h-3 w-2 bg-cream/[0.06] rounded" />
        <div className="h-3.5 w-40 bg-cream/10 rounded" />
      </nav>

      {/* Series header */}
      <header className="mb-12">
        {/* Cover image */}
        <div className="rounded-2xl overflow-hidden mb-8">
          <div className="w-full h-56 sm:h-72 bg-cream/10" />
        </div>

        <div className="max-w-2xl space-y-4">
          {/* Parts badge */}
          <div className="h-5 w-20 bg-cream/10 rounded-full" />
          {/* Title */}
          <div className="space-y-3">
            <div className="h-10 w-full bg-cream/10 rounded-lg" />
            <div className="h-10 w-3/5 bg-cream/10 rounded-lg" />
          </div>
          {/* Description */}
          <div className="space-y-2 pt-2">
            <div className="h-5 w-full bg-cream/[0.06] rounded" />
            <div className="h-5 w-5/6 bg-cream/[0.06] rounded" />
          </div>
        </div>
      </header>

      {/* Section divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-px bg-cream/10" />
        <div className="h-3 w-36 bg-cream/10 rounded" />
        <div className="flex-grow h-px bg-cream/[0.06]" />
      </div>

      {/* Post cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
