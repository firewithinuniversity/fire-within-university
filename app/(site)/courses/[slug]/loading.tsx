export default function CourseDetailLoading() {
  return (
    <div className="bg-brown-deep min-h-screen animate-pulse">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="h-4 w-40 bg-cream/[0.06] rounded" />
      </div>

      {/* Hero */}
      <section className="relative pt-6 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video sm:aspect-[21/9] rounded-2xl bg-cream/10 mb-8" />
          <div className="h-10 w-3/4 bg-cream/10 rounded-lg mb-4" />
          <div className="h-4 w-48 bg-cream/[0.06] rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-cream/[0.06] rounded" />
            <div className="h-4 w-5/6 bg-cream/[0.06] rounded" />
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="h-7 w-28 bg-cream/10 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-brown-card/40 rounded-xl p-4 border border-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-cream/10" />
                <div className="h-5 w-64 bg-cream/10 rounded" />
                <div className="ml-auto h-4 w-16 bg-cream/[0.06] rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
