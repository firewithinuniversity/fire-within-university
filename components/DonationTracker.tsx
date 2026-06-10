"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackDonationComplete } from "@/lib/analytics";

/**
 * Fires a GA4 "purchase" (donation_complete) event once when a donor lands on
 * the thank-you page after Stripe Checkout (audit H2). Stripe appends
 * ?session_id=... to the success URL; we use it as the transaction id so the
 * conversion is de-duplicated and attributable.
 *
 * Because GoogleAnalytics initializes from a separate effect (and may also
 * wait on cookie consent), window.gtag is usually undefined at the moment we
 * land. We poll briefly so the event fires once GA is ready instead of being
 * silently dropped by trackEvent's gtag check.
 */
const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 30_000; // give consent banners plenty of time

export default function DonationTracker() {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    const start = Date.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    function tryFire() {
      if (fired.current) return;
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        fired.current = true;
        trackDonationComplete(sessionId!);
        return;
      }
      if (Date.now() - start >= MAX_WAIT_MS) return;
      timer = setTimeout(tryFire, POLL_INTERVAL_MS);
    }
    tryFire();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchParams]);

  return null;
}
