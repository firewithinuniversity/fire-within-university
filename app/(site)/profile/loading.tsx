export default function ProfileLoading() {
  return (
    <div className="bg-brown-deep min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-24 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3.5 w-12 bg-cream/10 rounded" />
          <div className="h-3 w-2 bg-cream/[0.06] rounded" />
          <div className="h-3.5 w-20 bg-cream/10 rounded" />
        </div>

        {/* Page title */}
        <div className="h-9 w-48 bg-cream/10 rounded-lg mb-10" />

        <div className="space-y-10">
          {/* Profile card */}
          <div className="bg-brown-card border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-cream/10 flex-shrink-0" />
              <div className="flex-grow space-y-2 pt-1">
                <div className="h-5 w-40 bg-cream/10 rounded" />
                <div className="h-3.5 w-48 bg-cream/[0.06] rounded" />
                <div className="h-3 w-36 bg-cream/[0.06] rounded" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-brown-card border border-white/[0.08] rounded-xl p-5 text-center space-y-2"
              >
                <div className="h-8 w-10 bg-cream/10 rounded mx-auto" />
                <div className="h-3 w-24 bg-cream/[0.06] rounded mx-auto" />
              </div>
            ))}
          </div>

          {/* My Courses section */}
          <div>
            <div className="h-6 w-28 bg-cream/10 rounded mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-brown-card border border-white/[0.08] rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="h-5 w-48 bg-cream/10 rounded" />
                      <div className="h-3.5 w-64 bg-cream/[0.06] rounded" />
                    </div>
                    <div className="h-4 w-10 bg-cream/[0.06] rounded" />
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-cream/[0.06]" />
                  <div className="h-3 w-20 bg-cream/[0.06] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="h-6 w-36 bg-cream/10 rounded mb-5" />
            <div className="bg-brown-card border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-4 h-4 rounded-full bg-cream/10 flex-shrink-0" />
                  <div className="flex-grow space-y-1.5">
                    <div className="h-3.5 w-56 bg-cream/10 rounded" />
                    <div className="h-2.5 w-28 bg-cream/[0.06] rounded" />
                  </div>
                  <div className="h-3 w-12 bg-cream/[0.06] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
