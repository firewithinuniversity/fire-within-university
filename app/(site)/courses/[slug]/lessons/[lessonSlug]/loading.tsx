export default function LessonLoading() {
  return (
    <div className="bg-brown-deep min-h-screen animate-pulse">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-24">
        {/* Breadcrumb */}
        <div className="h-4 w-56 bg-cream/[0.06] rounded mb-8" />

        {/* Title */}
        <div className="h-9 w-3/4 bg-cream/10 rounded-lg mb-2" />
        <div className="h-4 w-32 bg-cream/[0.06] rounded mb-8" />

        {/* Video placeholder */}
        <div className="aspect-video rounded-xl bg-cream/10 mb-10" />

        {/* Body content */}
        <div className="space-y-4 mt-10">
          <div className="h-4 w-full bg-cream/[0.06] rounded" />
          <div className="h-4 w-11/12 bg-cream/[0.06] rounded" />
          <div className="h-4 w-4/5 bg-cream/[0.06] rounded" />
          <div className="h-4 w-full bg-cream/[0.06] rounded" />
          <div className="h-4 w-3/4 bg-cream/[0.06] rounded" />
        </div>
      </div>
    </div>
  );
}
