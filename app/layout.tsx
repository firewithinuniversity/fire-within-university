/**
 * app/layout.tsx — Root layout
 *
 * This is the outermost shell of the entire site. It renders once and wraps
 * every single page, including the Sanity Studio at /studio.
 *
 * What lives here:
 * - <html> and <body> tags (required in the root layout)
 * - Font loading via next/font (zero layout shift, self-hosted)
 * - Global CSS import
 * - Site-wide metadata defaults (title, description, OG image)
 *
 * What does NOT live here:
 * - Navbar and Footer — those are in app/(site)/layout.tsx so they
 *   don't appear on the /studio admin route
 * - Google Analytics — deferred to a Client Component so we can
 *   wait for cookie consent before firing
 *
 * PATTERN — next/font:
 * Instead of loading fonts from Google Fonts at runtime (which adds a
 * network request and can cause layout shift), next/font downloads the font
 * files at build time and self-hosts them. Zero external font requests.
 * The fonts are injected as CSS variables so Tailwind can reference them.
 */
import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Serif font for headings — warm, elegant, trustworthy
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap", // shows fallback font while loading (no invisible text)
});

// Sans-serif font for body text — clean, highly readable on mobile
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Default metadata — individual pages can override specific fields
export const metadata: Metadata = {
  title: {
    default: "Fire Within University",
    // %s = the page-specific title; e.g. "About | Fire Within University"
    template: "%s | Fire Within University",
  },
  description:
    "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
  // Open Graph metadata — controls how the site looks when shared on social media
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fire Within University",
  },
  // Tells search engine crawlers: index this page, follow its links
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Read the CSP nonce forwarded by middleware ────────────────────────────
  // middleware.ts sets x-nonce on the *request* headers for every page render.
  // We read it here so we can stamp it onto any <Script> tags in this layout.
  // WHY THIS MATTERS:
  // Our CSP blocks all inline scripts unless they carry a matching nonce attribute.
  // Without this, Next.js's own hydration scripts and any <Script> components
  // we add would be blocked by the browser — breaking the entire site.
  // The nonce is unique per request (crypto.randomUUID in middleware), so even
  // if an attacker could inject a <script> tag into the HTML, they cannot know
  // the nonce in advance and the browser refuses to run it.
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    // lang="en" is required for accessibility (screen readers)
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="bg-[#1a0f05] text-cream font-sans antialiased">
        {children}
        {/* Analytics — only activates after cookie consent */}
        <GoogleAnalytics nonce={nonce} />
        {/* Cookie consent banner — shows on first visit */}
        <CookieBanner />
      </body>
    </html>
  );
}
