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

export const ALLOWED_ONE_TIME_AMOUNTS_CENTS = [1000, 2500, 5000, 10000]; // $10, $25, $50, $100
export const ALLOWED_RECURRING_AMOUNTS_CENTS = [1000, 2500, 5000, 10000];
export const CUSTOM_AMOUNT_MIN_CENTS = 1000; // $10 minimum for custom amounts
export const CUSTOM_AMOUNT_MAX_CENTS = 100000; // $1000 maximum
