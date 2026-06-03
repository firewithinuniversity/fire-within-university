"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackDonationComplete } from "@/lib/analytics";

/**
 * Fires a GA4 "purchase" (donation_complete) event once when a donor lands on
 * the thank-you page after Stripe Checkout (audit H2). Stripe appends
 * ?session_id=... to the success URL; we use it as the transaction id so the
 * conversion is de-duplicated and attributable.
 */
export default function DonationTracker() {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    fired.current = true;
    trackDonationComplete(sessionId);
  }, [searchParams]);

  return null;
}
