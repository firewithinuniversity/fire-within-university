"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_ID } from "@/lib/env";

const CONSENT_KEY = "fwu_cookie_consent";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

type Props = {
  nonce?: string;
};

export default function GoogleAnalytics({ nonce }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === "true") {
      initGA(nonce);
    }

    function handleConsent() {
      initGA(nonce);
    }

    window.addEventListener("cookie-consent-accepted", handleConsent);
    return () =>
      window.removeEventListener("cookie-consent-accepted", handleConsent);
  }, [nonce]);

  // Track client-side route changes as pageviews. The initial pageview is sent
  // automatically by gtag("config"), so skip the first run to avoid a double
  // count, then fire on every subsequent App Router navigation (audit H1).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!gaInitialized || typeof window.gtag !== "function") return;
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

let gaInitialized = false;

function initGA(nonce?: string) {
  if (gaInitialized || !GA_ID) return;
  gaInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  if (nonce) script.setAttribute("nonce", nonce);
  document.head.appendChild(script);
}
