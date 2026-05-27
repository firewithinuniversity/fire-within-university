import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */

// SECURITY HEADERS NOTE:
// All security headers (CSP, X-Frame-Options, HSTS, Permissions-Policy, etc.)
// are now set in middleware.ts instead of here. This allows dynamic per-request
// CSP nonce generation, which replaces 'unsafe-inline'/'unsafe-eval' in script-src
// with a cryptographic nonce for stronger XSS protection.

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,

  // Ensure native/heavy server-only packages are never bundled for the client
  serverExternalPackages: ["bcrypt"],

  turbopack: {
    root: import.meta.dirname,
  },

  // next/image configuration: allows images from Sanity's CDN
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default analyzer(nextConfig);
