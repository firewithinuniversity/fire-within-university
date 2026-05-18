/**
 * lib/stripe.ts — Stripe server-side client
 *
 * Creates the Stripe instance used in API routes.
 * This file is SERVER-ONLY — never imported by client components.
 * The secret key must never reach the browser.
 *
 * PATTERN — lazy initialization:
 * We initialize inside a function rather than at module level so the
 * env validation only runs when Stripe is actually used, not during
 * static generation of pages that don't need Stripe.
 */
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      apiVersion: "2025-02-24.acacia", // pin to the installed SDK's API version
      typescript: true,
    });
  }
  return stripeInstance;
}

// ── Allowed donation amounts (server-side source of truth) ───────────────────
// SECURITY: Never trust the amount sent from the client.
// We validate against this list on the server before creating a Checkout session.
// Amount is in cents (Stripe always uses the smallest currency unit).
export const ALLOWED_ONE_TIME_AMOUNTS_CENTS = [1000, 2500, 5000, 10000]; // $10, $25, $50, $100
export const ALLOWED_RECURRING_AMOUNTS_CENTS = [1000, 2500, 5000, 10000];
export const CUSTOM_AMOUNT_MIN_CENTS = 1000; // $10 minimum for custom amounts
export const CUSTOM_AMOUNT_MAX_CENTS = 100000; // $1000 maximum
