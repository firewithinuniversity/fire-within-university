import type { Metadata } from "next";
import { Suspense } from "react";
import { Lora, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { organizationJsonLd, websiteJsonLd, canonicalUrl } from "@/lib/metadata";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl()),
  title: {
    default: "Fire Within University",
    template: "%s | Fire Within University",
  },
  description:
    "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
  manifest: "/manifest.webmanifest",
  other: {
    "theme-color": "#1a0f05",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fire Within University",
    url: canonicalUrl(),
    title: "Fire Within University",
    description:
      "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
    // images intentionally omitted: app/opengraph-image.tsx provides a properly
    // sized 1200x630 share card automatically, and Next.js does NOT deep-merge
    // openGraph on per-page metadata, so a literal image here would be dropped
    // by every page that defines its own openGraph block.
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheFireWithinUn",
    creator: "@TheFireWithinUn",
    title: "Fire Within University",
    description:
      "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
    // images intentionally omitted: file-based opengraph-image.tsx is used as
    // the Twitter image too. See openGraph comment above.
  },
  alternates: {
    canonical: canonicalUrl(),
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Fire Within University RSS Feed" }],
    },
  },
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
  // CSP nonce from middleware — required for script tags to pass Content Security Policy
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="bg-brown-deep text-cream font-sans antialiased overflow-x-hidden">
        {/* Structured data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()).replace(/</g, "\\u003c") }}
        />
        {children}
        {/* Sonner requires inline styles — these map to the design system:
            background ≈ brown-card darker, border ≈ cream/15, color ≈ cream */}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#2d1a0a",
              border: "1px solid rgba(212,184,150,0.15)",
              color: "#FDF6EC",
            },
          }}
        />
        <Suspense fallback={null}>
          <GoogleAnalytics nonce={nonce} />
        </Suspense>
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
      </body>
    </html>
  );
}
