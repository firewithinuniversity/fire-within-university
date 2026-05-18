/**
 * components/ShareButtons.tsx — Social share buttons
 *
 * Pure HTML links — no third-party scripts, no tracking pixels.
 * Twitter, Facebook, and a "copy link" button.
 *
 * PRIVACY: We never load social media SDKs. The share links are
 * standard web intents supported by all major platforms.
 *
 * COPY LINK: Uses the Clipboard API, falls back gracefully if unavailable.
 *
 * WHY "use client": Clipboard API, window.location, and useState.
 */
"use client";

import { useState } from "react";

type Props = {
  title: string;
  url?: string; // defaults to window.location.href if not provided
};

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  // Derive the URL — safe to reference `window` because this is client-only
  const pageUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const encoded = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable (HTTP or blocked) — fail silently
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold text-brown/50 uppercase tracking-widest">
        Share
      </span>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="flex items-center gap-1.5 text-xs font-semibold text-brown/60 hover:text-brown bg-brown/[0.07] hover:bg-brown/[0.12] px-3 py-2 rounded-full transition-all duration-150"
      >
        {/* X (Twitter) icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Post
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex items-center gap-1.5 text-xs font-semibold text-brown/60 hover:text-brown bg-brown/[0.07] hover:bg-brown/[0.12] px-3 py-2 rounded-full transition-all duration-150"
      >
        {/* Facebook icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Share
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        aria-label={copied ? "Link copied!" : "Copy link"}
        className="flex items-center gap-1.5 text-xs font-semibold text-brown/60 hover:text-brown bg-brown/[0.07] hover:bg-brown/[0.12] px-3 py-2 rounded-full transition-all duration-150"
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
