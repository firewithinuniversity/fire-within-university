/**
 * Lightweight GA4 event tracking helper.
 *
 * Calls window.gtag if it exists (respecting cookie consent).
 * Safe to call even before GA initializes — events are silently dropped
 * if the user hasn't consented or GA_ID is not set.
 *
 * Usage:
 *   trackEvent("lesson_complete", { course: "romans-101", lesson: "lesson-1" });
 */

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

// ── Pre-defined event helpers for type safety ────────────────────

export function trackLessonComplete(courseSlug: string, lessonSlug: string) {
  trackEvent("lesson_complete", {
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
  });
}

export function trackLessonUncomplete(courseSlug: string, lessonSlug: string) {
  trackEvent("lesson_uncomplete", {
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
  });
}

export function trackBookmarkAdd(type: string, slug: string) {
  trackEvent("bookmark_add", { content_type: type, slug });
}

export function trackBookmarkRemove(type: string, slug: string) {
  trackEvent("bookmark_remove", { content_type: type, slug });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent("search", { search_term: query, result_count: resultCount });
}

export function trackDonationStart(amount: number, frequency: string) {
  trackEvent("donation_start", {
    donation_amount: amount,
    donation_frequency: frequency,
  });
}

export function trackSignUp(method: string) {
  trackEvent("sign_up", { method });
}

export function trackSignIn(method: string) {
  trackEvent("login", { method });
}

export function trackContactSubmit() {
  trackEvent("contact_form_submit");
}
