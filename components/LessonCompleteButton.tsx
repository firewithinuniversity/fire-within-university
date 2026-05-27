"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { trackLessonComplete, trackLessonUncomplete } from "@/lib/analytics";
import { useAuthModal } from "./AuthModalProvider";

export default function LessonCompleteButton({
  lessonSlug,
  courseSlug,
}: {
  lessonSlug: string;
  courseSlug: string;
}) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!session) {
      setHydrated(true);
      return;
    }
    fetch(`/api/progress?courseSlug=${encodeURIComponent(courseSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        const slugs: string[] = (data.progress ?? []).map(
          (p: { lessonSlug: string }) => p.lessonSlug
        );
        setCompleted(slugs.includes(lessonSlug));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, [session, courseSlug, lessonSlug]);

  if (!hydrated) return null;

  // Logged-out: show muted button that opens auth modal
  if (!session) {
    return (
      <button
        onClick={openAuthModal}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 bg-cream/[0.08] text-cream/40 hover:bg-cream/[0.12] hover:text-cream/60 border border-cream/[0.06]"
        title="Sign in to track progress"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        Sign in to Track
      </button>
    );
  }

  async function toggle() {
    setLoading(true);
    const wasCompleted = completed;
    setCompleted(!wasCompleted);

    try {
      if (wasCompleted) {
        const res = await fetch(`/api/progress?lessonSlug=${encodeURIComponent(lessonSlug)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        toast.success("Lesson unmarked");
        trackLessonUncomplete(courseSlug, lessonSlug);
      } else {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonSlug, courseSlug }),
        });
        if (!res.ok) throw new Error();
        toast.success("Lesson completed!");
        trackLessonComplete(courseSlug, lessonSlug);
      }
    } catch {
      setCompleted(wasCompleted);
      toast.error("Failed to update progress. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={completed}
      aria-busy={loading}
      aria-label={completed ? "Mark lesson as incomplete" : "Mark lesson as complete"}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
        completed
          ? "bg-green-900/40 text-green-300 hover:bg-green-900/60 border border-green-700/30"
          : "bg-orange text-cream hover:bg-orange-hover"
      }`}
    >
      {completed ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
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
