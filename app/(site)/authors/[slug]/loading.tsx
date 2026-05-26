import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

export default function AuthorLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14 animate-pulse">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8">
        <div className="h-3.5 w-14 bg-cream/10 rounded" />
        <div className="h-3 w-2 bg-cream/[0.06] rounded" />
        <div className="h-3.5 w-32 bg-cream/10 rounded" />
      </nav>

      {/* Author card */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-14 bg-brown-card/70 rounded-2xl p-8 border border-white/[0.06]">
        <div className="w-20 h-20 rounded-full bg-cream/10 flex-shrink-0" />
        <div className="flex-grow space-y-2.5 pt-1">
          <div className="h-3 w-20 bg-cream/10 rounded" />
          <div className="h-8 w-48 bg-cream/10 rounded-lg" />
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-cream/[0.06] rounded" />
            <div className="h-4 w-4/5 bg-cream/[0.06] rounded" />
          </div>
          <div className="h-3 w-28 bg-cream/[0.06] rounded" />
        </div>
      </div>

      {/* Published Work header */}
      <div className="mb-8 space-y-1.5">
        <div className="h-3 w-28 bg-cream/10 rounded" />
        <div className="h-7 w-48 bg-cream/10 rounded" />
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
