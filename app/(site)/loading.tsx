export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[80vh] bg-brown-card/40 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
          <div className="h-4 w-64 bg-cream/10 rounded-full mx-auto" />
          <div className="space-y-3">
            <div className="h-12 w-96 bg-cream/10 rounded-lg mx-auto" />
            <div className="h-12 w-72 bg-cream/10 rounded-lg mx-auto" />
          </div>
          <div className="h-5 w-80 bg-cream/[0.06] rounded mx-auto" />
          <div className="flex gap-4 justify-center pt-4">
            <div className="h-12 w-52 bg-cream/10 rounded-full" />
            <div className="h-12 w-44 bg-cream/[0.06] rounded-full" />
          </div>
        </div>
      </div>

      {/* Featured courses skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="h-8 w-56 bg-cream/10 rounded-lg mx-auto mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden"
            >
              <div className="aspect-[16/9] bg-cream/10" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-cream/10 rounded" />
                <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
                <div className="h-3.5 w-2/3 bg-cream/[0.06] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
