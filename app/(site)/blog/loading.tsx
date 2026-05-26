import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

export default function BlogLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      {/* Page header */}
      <div className="text-center mb-14 space-y-4">
        <div className="w-4 h-6 bg-cream/10 rounded mx-auto" />
        <div className="h-10 w-72 bg-cream/10 rounded-lg mx-auto" />
        <div className="h-5 w-96 bg-cream/[0.06] rounded mx-auto" />
      </div>

      {/* Search bar skeleton */}
      <div className="max-w-lg mx-auto mb-10">
        <div className="h-12 w-full bg-cream/[0.04] rounded-full border border-cream/10" />
      </div>

      {/* Card grid — 6 placeholders matching the 3-col layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
