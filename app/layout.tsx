import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fire Within University",
    url: canonicalUrl(),
    title: "Fire Within University",
    description:
      "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fire Within University",
    description:
      "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
  },
  alternates: {
    canonical: canonicalUrl(),
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
      <body className="bg-brown-deep text-cream font-sans antialiased">
        {/* Structured data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#2d1a0a",
              border: "1px solid rgba(212,184,150,0.15)",
              color: "#F5EFE6",
            },
          }}
        />
        <GoogleAnalytics nonce={nonce} />
        <CookieBanner />
      </body>
    </html>
  );
}
