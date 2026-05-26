"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "fwu_cookie_consent";

type ConsentStatus = "unknown" | "accepted" | "declined";

export default function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "true") {
      setStatus("accepted");
    } else if (stored === "false") {
      setStatus("declined");
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "true");
    setStatus("accepted");
    window.dispatchEvent(new CustomEvent("cookie-consent-accepted"));
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "false");
    setStatus("declined");
  }

  if (status !== "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent notice"
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

        <div className="flex gap-3 flex-shrink-0" role="group" aria-label="Cookie consent actions">
          <button
            onClick={handleDecline}
            aria-label="Decline cookies"
            className="text-sm text-cream/60 hover:text-cream underline transition-colors min-h-[44px] min-w-[44px] px-3 py-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            aria-label="Accept cookies"
            className="bg-orange hover:bg-orange-hover text-cream text-sm font-semibold px-5 py-2.5 rounded-full transition-colors min-h-[44px]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
