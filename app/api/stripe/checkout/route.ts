/**
 * app/api/stripe/checkout/route.ts — Create Stripe Checkout session
 *
 * WHAT THIS DOES:
 * The donate page sends a POST request here with the amount and frequency.
 * We validate the input, create a Stripe Checkout session, and return the URL.
 * The browser then redirects the user to that Stripe-hosted URL.
 * After payment, Stripe redirects back to /thank-you.
 *
 * SECURITY — why we do this server-side:
 * 1. Amount validation: We verify the amount against our allowed list.
 *    If we let the browser set the amount, someone could donate $0.01.
 * 2. Secret key: The Stripe secret key is only used here, on the server.
 *    It never appears in any client-side bundle.
 * 3. Session creation: Creating sessions server-side means the checkout
 *    parameters (amount, currency, mode) are set by us, not the user.
 *
 * PATTERN — Zod validation:
 * Zod defines the expected shape of the request body and validates it
 * before we use any of the values. Invalid requests are rejected with 400.
 * This prevents type coercion attacks and unexpected inputs.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getStripe,
  ALLOWED_ONE_TIME_AMOUNTS_CENTS,
  ALLOWED_RECURRING_AMOUNTS_CENTS,
  CUSTOM_AMOUNT_MIN_CENTS,
  CUSTOM_AMOUNT_MAX_CENTS,
} from "@/lib/stripe";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

// ── Input validation schema ───────────────────────────────────────────────────
const CheckoutSchema = z.object({
  // Amount in cents
  amountCents: z.number().int().positive(),
  // Donation frequency
  frequency: z.enum(["once", "monthly"]),
});

const MAX_BODY_SIZE = 1024; // 1KB — checkout requests are tiny JSON payloads

export async function POST(request: Request) {
  // ── Body size limit (DoS protection) ──────────────────────────────────────
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getIpFromRequest(request);
  const allowed = checkRateLimit(ip, {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 per hour
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ── Parse and validate request body ──────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request." },
      { status: 400 }
    );
  }

  const result = CheckoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid donation details." },
      { status: 400 }
    );
  }

  const { amountCents, frequency } = result.data;

  // ── Server-side amount validation ─────────────────────────────────────────
  // SECURITY: Never trust the amount from the client.
  // Either it must be on our preset list, OR it's a custom amount within bounds.
  const allowedAmounts =
    frequency === "once"
      ? ALLOWED_ONE_TIME_AMOUNTS_CENTS
      : ALLOWED_RECURRING_AMOUNTS_CENTS;

  const isPresetAmount = allowedAmounts.includes(amountCents);
  const isValidCustomAmount =
    amountCents >= CUSTOM_AMOUNT_MIN_CENTS &&
    amountCents <= CUSTOM_AMOUNT_MAX_CENTS &&
    Number.isInteger(amountCents);

  if (!isPresetAmount && !isValidCustomAmount) {
    return NextResponse.json(
      { message: "Invalid donation amount." },
      { status: 400 }
    );
  }

  // ── Create Stripe Checkout session ────────────────────────────────────────
  try {
    const stripe = getStripe();

    // Determine the base URL for redirect URLs
    // In production this comes from the Vercel environment; in dev it's localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    let session;

    if (frequency === "once") {
      // One-time payment
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: "Donation to Fire Within University",
                description:
                  "Thank you for your generous support of this ministry.",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/donate`,
        // Metadata is stored with the session in Stripe dashboard
        metadata: {
          frequency: "once",
        },
      });
    } else {
      // Recurring monthly donation — requires a Price object
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              recurring: { interval: "month" },
              product_data: {
                name: "Monthly Support — Fire Within University",
                description:
                  "Your monthly gift sustains this ministry. Thank you!",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/donate`,
        metadata: {
          frequency: "monthly",
        },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log the full error server-side for debugging
    console.error("[Stripe Checkout Error]", error);

    // Return a generic message to the client — never expose internal details
    return NextResponse.json(
      { message: "Something went wrong processing your donation. Please try again." },
      { status: 500 }
    );
  }
}
