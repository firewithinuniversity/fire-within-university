import { NextResponse } from "next/server";
import type { NextRequest, ProxyConfig } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/rateLimit";
import { getNextAuthSecret } from "@/lib/env";

// Genuine NextAuth handler paths (the [...nextauth] route). These carry their
// own CSRF-token protection, so they're exempt from the Origin check. Custom
// routes under /api/auth/* (register, reset-password, delete-account, etc.) are
// intentionally NOT in this list — they must pass the Origin check (audit H3).
//
// Matching is exact OR a path-segment boundary, so "/api/auth/sessionFOO" is
// NOT silently exempted (review finding).
const NEXTAUTH_HANDLER_PREFIXES = [
  "/api/auth/callback",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/api/auth/_log",
];

function isNextAuthHandler(pathname: string): boolean {
  return NEXTAUTH_HANDLER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** Strip a default-port suffix and lowercase; drops the case where the value is empty. */
function normalizeHost(raw: string | null): string {
  if (!raw) return "";
  // x-forwarded-host can arrive as a comma-list when chained proxies append.
  // Take the left-most (closest-to-client) entry per RFC 7239 convention.
  const first = raw.split(",")[0].trim().toLowerCase();
  return first.replace(/:(80|443)$/, "");
}

export async function proxy(request: NextRequest) {
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
    const token = await getToken({ req: request, secret: getNextAuthSecret() });

    if (token?.role !== "ADMIN") {
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  }

  const nonce = crypto.randomUUID();

  // CSRF: validate origin on mutating API requests.
  // One rule: the Origin host must equal the host the request was actually
  // served on (handles vercel.app, custom domain, previews, dev, all at once
  // without trusting an env config that could drift). Cross-site browsers will
  // either send a different Origin (rejected) or omit it (rejected). The
  // header-spoofability concern is platform-specific and documented below.
  const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  if (isMutatingMethod && pathname.startsWith("/api/")) {
    const isStripeWebhook = pathname === "/api/stripe/webhook";
    const isNextAuth = isNextAuthHandler(pathname);

    if (!isStripeWebhook && !isNextAuth) {
      const origin = request.headers.get("origin");
      if (!origin) {
        return NextResponse.json({ message: "Missing Origin header." }, { status: 403 });
      }

      // We trust x-forwarded-host because Vercel sets it for us and overwrites
      // any client-supplied value. Self-hosters MUST front the app with a proxy
      // that does the same (the standard nginx/caddy pattern). On Vercel and
      // any correctly configured reverse proxy, this header reflects the real
      // serving host, normalized below for case + default ports + comma-lists.
      const servedHost =
        normalizeHost(request.headers.get("x-forwarded-host")) ||
        normalizeHost(request.headers.get("host"));

      let originHost = "";
      try {
        originHost = new URL(origin).host.toLowerCase().replace(/:(80|443)$/, "");
      } catch {
        originHost = "";
      }

      if (originHost === "" || originHost !== servedHost) {
        return NextResponse.json({ message: "Forbidden: origin not allowed." }, { status: 403 });
      }

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
    `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic'${unsafeEval} https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com https://i.ytimg.com https://lh3.googleusercontent.com`,
    `frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com`,
    `connect-src 'self' https://api.sanity.io https://*.sanity.io https://www.google-analytics.com https://analytics.google.com https://api.stripe.com https://bible-api.com https://accounts.google.com https://apis.google.com`,
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
  // NOTE: nonce is passed to server components via the x-nonce REQUEST header (line above).
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

export const config: ProxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
