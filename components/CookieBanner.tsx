/**
 * components/CookieBanner.tsx — Cookie consent banner
 *
 * GDPR/CCPA requirement: You cannot set analytics cookies or load
 * tracking scripts until the user has explicitly consented.
 *
 * HOW IT WORKS:
 * 1. On first visit, we show a consent banner at the bottom of the page.
 * 2. If the user clicks "Accept", we store "cookie_consent=true" in localStorage
 *    and fire a custom event that tells GoogleAnalytics to initialize.
 * 3. If the user clicks "Decline", we store "cookie_consent=false" and
 *    GA is never loaded.
 * 4. On subsequent visits, we read localStorage — if consent was given,
 *    GA loads immediately. If not, we never load it.
 *
 * WHY localStorage vs cookies:
 * Using localStorage for the consent preference itself doesn't require
 * a cookie consent notice for that storage (since it's used to PREVENT
 * tracking, not enable it). The analytics cookies are only set by GA
 * after consent.
 *
 * WHY "use client": localStorage, window.dispatchEvent, and useState
 * are all browser-only APIs.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "fwu_cookie_consent"; // namespaced to avoid conflicts

type ConsentStatus = "unknown" | "accepted" | "declined";

export default function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    // Check if user has already made a decision
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "true") {
      setStatus("accepted");
    } else if (stored === "false") {
      setStatus("declined");
    }
    // If nothing stored, status stays "unknown" → banner shows
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "true");
    setStatus("accepted");
    // Tell GoogleAnalytics component to initialize
    window.dispatchEvent(new CustomEvent("cookie-consent-accepted"));
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "false");
    setStatus("declined");
  }

  // Don't render if user has already decided (or during SSR)
  if (status !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 bg-brown/95 backdrop-blur-md text-cream shadow-xl border-t border-gold/20 px-4 py-4 md:py-3"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="text-sm text-cream/80 max-w-2xl">
          We use cookies for anonymous analytics to improve your experience.
          Your data is never sold. See our{" "}
          <Link
            href="/privacy-policy"
            className="underline hover:text-gold transition-colors"
          >
            Privacy Policy
          </Link>{" "}
          for details.
        </p>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="text-sm text-cream/60 hover:text-cream underline transition-colors min-h-[44px] min-w-[44px] px-3 py-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-orange hover:bg-orange-hover text-cream text-sm font-semibold px-5 py-2.5 rounded-full transition-colors min-h-[44px]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
