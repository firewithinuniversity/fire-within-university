"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CourseProgressBar({
  courseSlug,
  totalLessons,
}: {
  courseSlug: string;
  totalLessons: number;
}) {
  const { data: session } = useSession();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/progress?courseSlug=${encodeURIComponent(courseSlug)}`)
      .then((res) => res.json())
      .then((data) => setCompletedCount(data.progress?.length ?? 0))
      .catch(() => {});
  }, [session, courseSlug]);

  if (!session || totalLessons === 0) return null;

  const pct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-cream/50">
        <span>
          {completedCount} of {totalLessons} complete
        </span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-cream/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange to-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
