/**
 * Reusable skeleton placeholder for a course card.
 * Matches the course card layout: cover image, title, description, meta row.
 */
export default function CourseCardSkeleton() {
  return (
    <div className="bg-brown-card/40 border border-white/[0.04] rounded-2xl overflow-hidden animate-pulse">
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
  );
}
