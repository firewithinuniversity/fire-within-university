import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/rateLimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  // Login rate limiting (5 attempts / 15 min)
  if (request.method === "POST" && pathname === "/api/auth/callback/credentials") {
    if (!checkRateLimit(ip, { maxRequests: 5, windowMs: 15 * 60 * 1000 })) {
      console.warn(`[Security] Login rate limited: ${ip}`);
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Admin API rate limiting (60 req / min)
  if (pathname.startsWith("/api/admin/")) {
    if (!checkRateLimit(`admin-api:${ip}`, { maxRequests: 60, windowMs: 60 * 1000 })) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Admin route protection
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/")
  ) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token?.role !== "ADMIN") {
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  }

  const nonce = crypto.randomUUID();

  // CSRF: validate origin on mutating API requests
  const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  if (isMutatingMethod && pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    let expectedOrigin: string;
    try {
      expectedOrigin = new URL(baseUrl).origin;
    } catch {
      expectedOrigin = "http://localhost:3000";
    }

    const isDev = process.env.NODE_ENV === "development";
    const isLocalhostOrigin =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    const isStripeWebhook = pathname === "/api/stripe/webhook";
    const isNextAuth = pathname.startsWith("/api/auth/");

    if (!isStripeWebhook && !isNextAuth) {
      if (!origin) {
        return NextResponse.json({ message: "Missing Origin header." }, { status: 403 });
      }

      const originAllowed = origin === expectedOrigin || (isDev && isLocalhostOrigin);

      if (!originAllowed) {
        return NextResponse.json({ message: "Forbidden: origin not allowed." }, { status: 403 });
      }
    }

    if (!isStripeWebhook && !isNextAuth) {
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        return NextResponse.json({ message: "Content-Type must be application/json." }, { status: 415 });
      }
    }
  }

  // CSP
  const unsafeEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${unsafeEval} https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://static.mailchimp.com https://chimpstatic.com https://accounts.google.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com https://i.ytimg.com https://lh3.googleusercontent.com`,
    `frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com`,
    `connect-src 'self' https://api.sanity.io https://*.sanity.io https://www.google-analytics.com https://analytics.google.com https://api.mailchimp.com https://*.mailchimp.com https://api.stripe.com https://bible-api.com https://accounts.google.com https://apis.google.com`,
    `media-src 'self' https://cdn.sanity.io`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);
  // NOTE: nonce is passed to server components via the x-nonce REQUEST header (line 112).
  // We intentionally do NOT expose it as a response header to prevent scripts from reading it.
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=(), browsing-topics=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
