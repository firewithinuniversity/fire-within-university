/**
 * lib/constants.ts — Shared, non-secret constants.
 *
 * Centralizes values that were previously duplicated across many files
 * (production URL, sender/contact emails) so a domain or address change is a
 * single edit. None of these are secrets.
 */

/** Canonical production origin. Used as the fallback when NEXT_PUBLIC_BASE_URL is unset. */
export const PRODUCTION_BASE_URL = "https://www.firewithinuniversity.com";

/**
 * Resolves the site's base URL: env override first, production fallback second.
 * Never falls back to localhost in code paths that can run in production
 * (e.g. Stripe redirect URLs) — see audit H7.
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || PRODUCTION_BASE_URL;
}

/** Transactional / no-reply sender address. */
export const EMAIL_FROM_NOREPLY = "noreply@firewithinuniversity.com";
/** Contact-form delivery / reply-to address. */
export const EMAIL_CONTACT = "contact@firewithinuniversity.com";
/** General ministry inbox shown publicly (terms, privacy, etc.). */
export const EMAIL_HELLO = "hello@firewithinuniversity.com";
