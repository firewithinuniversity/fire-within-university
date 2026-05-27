export default function AboutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 animate-pulse">
      {/* Mission section skeleton */}
      <div className="text-center mb-20 space-y-6">
        <div className="w-4 h-6 bg-cream/10 rounded mx-auto" />
        <div className="h-10 bg-cream/10 rounded-lg w-3/4 mx-auto" />
        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="h-4 bg-cream/[0.06] rounded w-full" />
          <div className="h-4 bg-cream/[0.06] rounded w-5/6 mx-auto" />
          <div className="h-4 bg-cream/[0.06] rounded w-4/5 mx-auto" />
        </div>
        <div className="h-24 bg-brown-card/60 rounded-2xl max-w-lg mx-auto" />
      </div>

      {/* Pillars skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-brown-card/70 border border-white/[0.06] rounded-2xl p-6 space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-cream/[0.06] mx-auto" />
            <div className="h-5 bg-cream/10 rounded w-1/2 mx-auto" />
            <div className="space-y-1.5">
              <div className="h-3 bg-cream/[0.06] rounded w-full" />
              <div className="h-3 bg-cream/[0.06] rounded w-4/5 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="mb-20 py-12 px-6 bg-brown-card/60 border border-white/[0.06] rounded-2xl text-center">
        <div className="h-7 bg-cream/10 rounded w-1/3 mx-auto mb-3" />
        <div className="h-4 bg-cream/[0.06] rounded w-1/2 mx-auto mb-6" />
        <div className="h-12 bg-cream/[0.08] rounded-full max-w-md mx-auto" />
      </div>

      {/* Team skeleton */}
      <div className="h-8 bg-cream/10 rounded w-1/4 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-5 items-start p-6 bg-brown-card/70 border border-white/[0.06] rounded-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-cream/[0.08] flex-shrink-0" />
            <div className="flex-grow space-y-2">
              <div className="h-5 bg-cream/10 rounded w-2/3" />
              <div className="h-3 bg-gold/10 rounded w-1/3" />
              <div className="h-3 bg-cream/[0.06] rounded w-full" />
              <div className="h-3 bg-cream/[0.06] rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
