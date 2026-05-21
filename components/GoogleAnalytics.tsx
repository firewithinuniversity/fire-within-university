"use client";

import { useEffect } from "react";
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
