/**
 * app/api/stripe/webhook/route.ts — Stripe webhook handler
 *
 * Stripe calls this endpoint to notify you about payment events:
 * - checkout.session.completed (payment succeeded)
 * - customer.subscription.deleted (subscription cancelled)
 * - invoice.payment_failed (monthly donation failed)
 * etc.
 *
 * SECURITY — Webhook signature verification:
 * Anyone on the internet could POST to this URL with fake data.
 * Stripe signs every webhook with your STRIPE_WEBHOOK_SECRET.
 * We verify that signature BEFORE processing any event.
 * If verification fails, we reject the request immediately.
 * This is the most important security measure in this file.
 *
 * IMPORTANT — raw body:
 * Stripe's signature verification requires the raw (unmodified) request body.
 * Next.js normally parses JSON automatically. We must read the raw bytes
 * using request.arrayBuffer() and pass them to Stripe's verifyHeader().
 * If we used request.json() instead, the signature would fail.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/env";

const MAX_BODY_SIZE = 64 * 1024; // 64KB — webhook payloads are moderate JSON

export async function POST(request: Request) {
  // ── Body size limit (DoS protection) ──────────────────────────────────────
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  // Read the raw request body (required for signature verification)
  const rawBody = await request.arrayBuffer();
  const rawBodyBuffer = Buffer.from(rawBody);

  // Get the Stripe signature from the request header
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { message: "Missing signature." },
      { status: 400 }
    );
  }

  // ── Verify the webhook signature ──────────────────────────────────────────
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBodyBuffer,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed");
    return NextResponse.json(
      { message: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  // ── Process verified events ───────────────────────────────────────────────
  // Only handle events we care about; ignore everything else safely.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Donation was successful
        // Phase 2: send thank-you email, record in database, etc.
        console.log(`[Stripe Webhook] checkout.session.completed`);
        break;
      }

      case "customer.subscription.deleted": {
        // Monthly donor cancelled their subscription
        console.log(`[Stripe Webhook] customer.subscription.deleted`);
        break;
      }

      case "invoice.payment_failed": {
        // Monthly donation failed (expired card, etc.)
        console.log(`[Stripe Webhook] invoice.payment_failed`);
        break;
      }

      default:
        // Unknown event type — log type only, never log payload (do NOT throw)
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    // Return 200 to prevent Stripe from retrying an event we received correctly
    // The error is in our processing, not the delivery
    return NextResponse.json({ received: true });
  }
}

// NOTE: In Next.js App Router, route handlers already receive the raw Request
// object — there is no automatic body parsing to disable. The old pages/api
// config.api.bodyParser export is not needed and has no effect here.
