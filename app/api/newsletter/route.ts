/**
 * app/api/newsletter/route.ts — Mailchimp newsletter signup
 *
 * Subscribes an email to the Mailchimp audience list.
 *
 * WHY WE USE MAILCHIMP'S API vs. their embedded form:
 * - We control the UX completely (our form, our styles)
 * - Double opt-in is still enforced by Mailchimp (configured in their settings)
 * - The API key stays on the server — never exposed to the browser
 *
 * IMPORTANT — double opt-in:
 * We set status: "pending" which triggers Mailchimp to send a confirmation
 * email. The subscriber is not added until they click the link.
 * This is required for GDPR compliance and keeps your list clean.
 *
 * PRIVACY:
 * We never store email addresses in our own database.
 * Mailchimp handles all storage, unsubscribes, and GDPR deletion requests.
 * Every email from Mailchimp includes an unsubscribe link (required by law).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";
import {
  getMailchimpApiKey,
  getMailchimpAudienceId,
  getMailchimpServerPrefix,
} from "@/lib/env";
import crypto from "crypto";

// ── Input validation ──────────────────────────────────────────────────────────
const NewsletterSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
});

const MAX_BODY_SIZE = 1024; // 1KB — newsletter signup is just an email address

export async function POST(request: Request) {
  // ── Body size limit (DoS protection) ──────────────────────────────────────
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getIpFromRequest(request);
  const allowed = checkRateLimit(ip, {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 per hour
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = NewsletterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const { email } = result.data;

  // ── Call Mailchimp API ────────────────────────────────────────────────────
  try {
    const apiKey = getMailchimpApiKey();
    const audienceId = getMailchimpAudienceId();
    const server = getMailchimpServerPrefix();

    // Mailchimp uses MD5 hash of lowercase email as the member identifier
    const emailHash = crypto
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    // PUT vs POST: PUT is idempotent — works for both new subscribers
    // and re-subscribing someone who previously unsubscribed
    const response = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          // "pending" triggers double opt-in confirmation email (GDPR compliant)
          status_if_new: "pending",
          // If already subscribed, don't change their status
          status: "pending",
        }),
      }
    );

    const data = await response.json();

    // Handle Mailchimp-specific error codes
    if (!response.ok) {
      // Member was permanently deleted from the list — they must re-subscribe manually
      if (data.title === "Member In Compliance State") {
        return NextResponse.json(
          {
            message:
              "This email has been unsubscribed. Please contact us directly to re-subscribe.",
          },
          { status: 400 }
        );
      }

      console.error("[Mailchimp Error]", data);
      return NextResponse.json(
        { message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    // Success — if already subscribed, Mailchimp returns status "subscribed"
    if (data.status === "subscribed") {
      return NextResponse.json({
        message: "You're already subscribed — thanks for being here!",
      });
    }

    return NextResponse.json({
      message:
        "Almost there! Check your inbox for a confirmation email to complete your signup.",
    });
  } catch (error) {
    console.error("[Newsletter Signup Error]", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
