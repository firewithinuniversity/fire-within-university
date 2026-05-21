export default function PostLoading() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3.5 w-32 bg-cream/10 rounded" />
        <div className="h-3 w-2 bg-cream/[0.06] rounded" />
        <div className="h-3.5 w-48 bg-cream/10 rounded" />
      </div>

      {/* Post header */}
      <header className="mb-8 space-y-4">
        {/* Category */}
        <div className="h-3 w-20 bg-cream/10 rounded-full" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-9 w-full bg-cream/10 rounded-lg" />
          <div className="h-9 w-4/5 bg-cream/10 rounded-lg" />
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream/10 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-cream/10 rounded" />
            <div className="h-3 w-40 bg-cream/[0.06] rounded" />
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <div className="w-full h-72 bg-cream/10" />
      </div>

      {/* Body text paragraphs */}
      <div className="mb-10 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-cream/[0.06] rounded" />
            <div className="h-4 w-full bg-cream/[0.06] rounded" />
            <div className="h-4 w-11/12 bg-cream/[0.06] rounded" />
            <div className="h-4 w-4/5 bg-cream/[0.06] rounded" />
          </div>
        ))}
        {/* Subheading */}
        <div className="h-7 w-56 bg-cream/10 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-cream/[0.06] rounded" />
            <div className="h-4 w-10/12 bg-cream/[0.06] rounded" />
            <div className="h-4 w-3/4 bg-cream/[0.06] rounded" />
          </div>
        ))}
      </div>

      {/* Author card */}
      <div className="border-t border-cream/[0.06] pt-8 mb-10">
        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 rounded-full bg-cream/10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-36 bg-cream/10 rounded" />
            <div className="h-3.5 w-full bg-cream/[0.06] rounded" />
            <div className="h-3.5 w-4/5 bg-cream/[0.06] rounded" />
          </div>
        </div>
      </div>

      {/* Email signup block */}
      <div className="bg-brown-card/40 border border-white/[0.04] rounded-2xl p-8 mb-8 space-y-3">
        <div className="h-6 w-48 bg-cream/10 rounded mx-auto" />
        <div className="h-4 w-64 bg-cream/[0.06] rounded mx-auto" />
        <div className="h-11 w-full bg-cream/10 rounded-full mt-4" />
      </div>
    </article>
  );
}
