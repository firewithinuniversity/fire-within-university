export default function BlogLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      {/* Page header */}
      <div className="text-center mb-14 space-y-4">
        <div className="w-4 h-6 bg-cream/10 rounded mx-auto" />
        <div className="h-10 w-72 bg-cream/10 rounded-lg mx-auto" />
        <div className="h-5 w-96 bg-cream/[0.06] rounded mx-auto" />
      </div>

      {/* Card grid — 6 placeholders matching the 3-col layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden"
          >
            {/* Cover image area */}
            <div className="aspect-[16/9] bg-cream/10" />

            {/* Card body */}
            <div className="p-5 space-y-3">
              {/* Category tag */}
              <div className="h-3 w-20 bg-cream/10 rounded-full" />
              {/* Title */}
              <div className="space-y-2">
                <div className="h-5 w-full bg-cream/10 rounded" />
                <div className="h-5 w-4/5 bg-cream/10 rounded" />
              </div>
              {/* Excerpt */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
                <div className="h-3.5 w-11/12 bg-cream/[0.06] rounded" />
                <div className="h-3.5 w-3/4 bg-cream/[0.06] rounded" />
              </div>
              {/* Author + date row */}
              <div className="flex items-center gap-2 pt-2">
                <div className="w-7 h-7 rounded-full bg-cream/10 shrink-0" />
                <div className="h-3 w-28 bg-cream/[0.06] rounded" />
                <div className="ml-auto h-3 w-16 bg-cream/[0.06] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
