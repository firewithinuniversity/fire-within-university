/**
 * components/GoogleAnalytics.tsx — Google Analytics 4 integration
 *
 * CRITICAL GDPR REQUIREMENT:
 * This component loads GA ONLY after cookie consent is given.
 * It checks on mount and also listens for the consent event fired by CookieBanner.
 * If the user has not consented, the GA script is NEVER requested.
 *
 * HOW GA SCRIPT LOADING WORKS:
 * We dynamically create a <script> tag and append it to <head>.
 * This is the standard "load analytics only when needed" pattern.
 *
 * GA_ID is the measurement ID from your Google Analytics 4 property
 * (format: G-XXXXXXXXXX). It's prefixed NEXT_PUBLIC_ because it's used
 * client-side — it's not a secret (it's visible in the page source).
 *
 * Note: GA_ID being empty string in dev (no NEXT_PUBLIC_GA_ID set) is fine —
 * the script loads but gtag calls are no-ops without a valid ID.
 */
"use client";

import { useEffect } from "react";
import { GA_ID } from "@/lib/env";

const CONSENT_KEY = "fwu_cookie_consent";

// Extend the Window type to include GA's global function
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

type Props = {
  // The CSP nonce from the root layout, forwarded from middleware.
  // Stamped onto the dynamically injected GA <script> tag so the browser
  // allows it under our strict nonce-based Content Security Policy.
  nonce?: string;
};

export default function GoogleAnalytics({ nonce }: Props) {
  useEffect(() => {
    // Check if consent was already given in a previous session
    if (localStorage.getItem(CONSENT_KEY) === "true") {
      initGA(nonce);
    }

    // Listen for consent being given in this session (from CookieBanner)
    function handleConsent() {
      initGA(nonce);
    }

    window.addEventListener("cookie-consent-accepted", handleConsent);
    return () =>
      window.removeEventListener("cookie-consent-accepted", handleConsent);
  }, [nonce]);

  return null; // This component renders no visible UI
}

let gaInitialized = false;

function initGA(nonce?: string) {
  if (gaInitialized || !GA_ID) return;
  gaInitialized = true;

  // Initialize the dataLayer (required before the gtag script loads)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  // NOTE: anonymize_ip is no longer needed — GA4 anonymizes IPs by default
  // and the option was deprecated. Including it is a no-op but confusing.
  window.gtag("config", GA_ID);

  // Dynamically load the GA script.
  // The nonce attribute is required under our CSP — without it the browser
  // would block this script even though it's from googletagmanager.com.
  // Under 'strict-dynamic', scripts loaded by nonced scripts are trusted,
  // but the root injection point still needs the nonce.
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  if (nonce) script.setAttribute("nonce", nonce);
  document.head.appendChild(script);
}
