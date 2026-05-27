"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Props = {
  courseSlug: string;
  totalLessons: number;
};

export default function CourseProgressMini({ courseSlug, totalLessons }: Props) {
  const { data: session } = useSession();
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!session || totalLessons === 0) return;
    fetch(`/api/progress?courseSlug=${encodeURIComponent(courseSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        const count = data.progress?.length ?? 0;
        if (count > 0) setCompletedCount(count);
      })
      .catch(() => {});
  }, [session, courseSlug, totalLessons]);

  // Only show if user has started the course (completed > 0)
  if (completedCount === null || completedCount === 0) return null;

  const pct = Math.round((completedCount / totalLessons) * 100);
  const isComplete = pct >= 100;

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream/[0.06]">
      <div className="flex-grow h-1.5 rounded-full bg-cream/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? "bg-green-500" : "bg-gradient-to-r from-orange to-gold"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs flex-shrink-0 ${isComplete ? "text-green-400" : "text-cream/40"}`}>
        {completedCount}/{totalLessons}
      </span>
    </div>
  );
}
