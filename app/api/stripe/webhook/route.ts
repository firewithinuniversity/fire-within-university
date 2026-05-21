import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/env";

const MAX_BODY_SIZE = 64 * 1024; // 64KB — webhook payloads are moderate JSON

export async function POST(request: Request) {
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  let rawBodyBuffer: Buffer;
  try {
    rawBodyBuffer = Buffer.from(await request.arrayBuffer());
  } catch {
    return NextResponse.json({ message: "Could not read request body." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { message: "Missing signature." },
      { status: 400 }
    );
  }

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log(`[Stripe Webhook] checkout.session.completed`);
        break;
      }

      case "customer.subscription.deleted": {
        console.log(`[Stripe Webhook] customer.subscription.deleted`);
        break;
      }

      case "invoice.payment_failed": {
        console.log(`[Stripe Webhook] invoice.payment_failed`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    // Return 200 so Stripe doesn't retry an event we already received
    return NextResponse.json({ received: true });
  }
}
