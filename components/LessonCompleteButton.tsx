"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function LessonCompleteButton({
  lessonSlug,
  courseSlug,
  initialCompleted = false,
}: {
  lessonSlug: string;
  courseSlug: string;
  initialCompleted?: boolean;
}) {
  const { data: session } = useSession();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  async function toggle() {
    setLoading(true);
    const wasCompleted = completed;
    setCompleted(!wasCompleted);

    try {
      if (wasCompleted) {
        await fetch(`/api/progress?lessonSlug=${encodeURIComponent(lessonSlug)}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonSlug, courseSlug }),
        });
      }
    } catch {
      setCompleted(wasCompleted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
        completed
          ? "bg-green-900/40 text-green-300 hover:bg-green-900/60 border border-green-700/30"
          : "bg-orange text-cream hover:bg-orange-hover"
      }`}
    >
      {completed ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Completed
        </>
      ) : (
        "Mark Complete"
      )}
    </button>
  );
}
