export default function CoursesLoading() {
  return (
    <div className="bg-brown-deep min-h-screen animate-pulse">
      {/* Header section */}
      <section className="pt-32 pb-16 text-center px-4 sm:px-6">
        <div className="h-3 w-40 bg-cream/10 rounded-full mx-auto mb-4" />
        <div className="h-12 w-48 bg-cream/10 rounded-lg mx-auto mb-6" />
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="h-5 w-full bg-cream/[0.06] rounded" />
          <div className="h-5 w-5/6 bg-cream/[0.06] rounded mx-auto" />
          <div className="h-5 w-4/6 bg-cream/[0.06] rounded mx-auto" />
        </div>
      </section>

      {/* Course card grid — 3 placeholders */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden"
            >
              {/* Cover image */}
              <div className="aspect-[16/9] bg-cream/10" />

              {/* Card body */}
              <div className="p-6 space-y-3">
                {/* Title */}
                <div className="h-6 w-3/4 bg-cream/10 rounded" />
                {/* Description */}
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
                  <div className="h-3.5 w-10/12 bg-cream/[0.06] rounded" />
                </div>
                {/* Instructor / lesson count row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-28 bg-cream/[0.06] rounded" />
                  <div className="h-3 w-16 bg-cream/[0.06] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
