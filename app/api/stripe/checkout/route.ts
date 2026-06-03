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
import { getBaseUrl } from "@/lib/constants";

const CheckoutSchema = z.object({
  amountCents: z.number().int().positive(),
  frequency: z.enum(["once", "monthly"]),
});

const MAX_BODY_SIZE = 1024; // 1KB — checkout requests are tiny JSON payloads

export async function POST(request: Request) {
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

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

  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    let session;

    if (frequency === "once") {
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
        metadata: {
          frequency: "once",
        },
      });
    } else {
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
    console.error("[Stripe Checkout Error]", error);
    return NextResponse.json(
      { message: "Something went wrong processing your donation. Please try again." },
      { status: 500 }
    );
  }
}
