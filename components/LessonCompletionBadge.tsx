"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Small checkmark badge shown next to lesson items in the course detail page.
 * Fetches the user's completion state for the course and shows a green check
 * next to completed lessons.
 *
 * Renders nothing for logged-out users (no layout shift).
 */
export default function LessonCompletionBadge({
  lessonSlug,
  courseSlug,
}: {
  lessonSlug: string;
  courseSlug: string;
}) {
  const { data: session } = useSession();
  const [completed, setCompleted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/progress?courseSlug=${encodeURIComponent(courseSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        const slugs: string[] = (data.progress ?? []).map(
          (p: { lessonSlug: string }) => p.lessonSlug
        );
        setCompleted(slugs.includes(lessonSlug));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [session, courseSlug, lessonSlug]);

  if (!session || !loaded || !completed) return null;

  return (
    <span
      className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/50 border border-green-700/30 flex items-center justify-center"
      title="Completed"
      aria-label="Lesson completed"
    >
      <svg
        className="w-3.5 h-3.5 text-green-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    </span>
  );
}
