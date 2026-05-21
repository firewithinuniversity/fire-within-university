export default function SeriesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14 animate-pulse">
      {/* Header */}
      <div className="mb-12 space-y-3">
        <div className="h-3 w-36 bg-cream/10 rounded-full" />
        <div className="h-10 w-64 bg-cream/10 rounded-lg" />
        <div className="space-y-1.5 max-w-xl">
          <div className="h-5 w-full bg-cream/[0.06] rounded" />
          <div className="h-5 w-4/5 bg-cream/[0.06] rounded" />
        </div>
      </div>

      {/* Series card grid — 3 placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Cover image */}
            <div className="aspect-video bg-cream/10" />

            {/* Card body */}
            <div className="p-6 flex flex-col gap-3">
              {/* Parts badge */}
              <div className="h-5 w-16 bg-cream/10 rounded-full self-start" />
              {/* Title */}
              <div className="h-6 w-4/5 bg-cream/10 rounded" />
              {/* Description */}
              <div className="space-y-1.5 flex-grow">
                <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
                <div className="h-3.5 w-10/12 bg-cream/[0.06] rounded" />
              </div>
              {/* Begin series link */}
              <div className="h-4 w-28 bg-cream/10 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
