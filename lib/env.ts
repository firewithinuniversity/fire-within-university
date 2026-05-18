/**
 * lib/env.ts — Environment variable validation
 *
 * This module validates that all required environment variables are present
 * at startup. If any are missing, it throws a clear error immediately rather
 * than letting the app fail later with a confusing undefined error.
 *
 * PATTERN: Centralizing env access here means:
 * 1. One place to see all required variables
 * 2. Type-safe access everywhere else in the codebase
 * 3. Clear error messages during local dev and Vercel build failures
 *
 * SECURITY: Variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
 * Everything else is server-only. Never put secrets in NEXT_PUBLIC_ variables.
 */

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required server environment variable: ${name}\n` +
        `Check your .env.local file and make sure it is set.\n` +
        `See .env.example for all required variables.`
    );
  }
  return value;
}

function requirePublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // In production, throw hard — a missing public env var means the app is misconfigured.
    // In development, warn and return empty string so pages still render (with empty state).
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required public environment variable: ${name}\n` +
          `Set it in the Vercel dashboard or your deployment environment.`
      );
    }
    console.warn(`[env] Missing ${name} — add it to .env.local (see .env.example). Pages will show empty state.`);
    return "";
  }
  return value;
}

// --- Sanity (public — needed by the browser to query content) ---
export const SANITY_PROJECT_ID = requirePublicEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
);
export const SANITY_DATASET = requirePublicEnv("NEXT_PUBLIC_SANITY_DATASET");

// --- Sanity (server-only tokens — never exposed to the browser) ---
// These are accessed lazily (inside functions) so they only throw at runtime
// on the server, not during static builds of public pages.
export function getSanityReadToken(): string {
  return requireServerEnv("SANITY_API_READ_TOKEN");
}

export function getSanityWriteToken(): string {
  return requireServerEnv("SANITY_API_WRITE_TOKEN");
}

export function getSanityPreviewSecret(): string {
  return requireServerEnv("SANITY_PREVIEW_SECRET");
}

// --- Stripe ---
export const STRIPE_PUBLISHABLE_KEY = requirePublicEnv(
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
);

export function getStripeSecretKey(): string {
  return requireServerEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return requireServerEnv("STRIPE_WEBHOOK_SECRET");
}

// --- Mailchimp (server-only) ---
export function getMailchimpApiKey(): string {
  return requireServerEnv("MAILCHIMP_API_KEY");
}

export function getMailchimpAudienceId(): string {
  return requireServerEnv("MAILCHIMP_AUDIENCE_ID");
}

export function getMailchimpServerPrefix(): string {
  return requireServerEnv("MAILCHIMP_SERVER_PREFIX");
}

// --- Google Analytics (public) ---
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""; // optional in dev

// --- Contact form (server-only) ---
export function getContactFormEmail(): string {
  return requireServerEnv("CONTACT_FORM_EMAIL");
}

export function getResendApiKey(): string {
  return requireServerEnv("RESEND_API_KEY");
}
