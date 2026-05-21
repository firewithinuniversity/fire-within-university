import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";
import {
  getMailchimpApiKey,
  getMailchimpAudienceId,
  getMailchimpServerPrefix,
} from "@/lib/env";
import crypto from "crypto";

const NewsletterSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
});

const MAX_BODY_SIZE = 1024; // 1KB — newsletter signup is just an email address

export async function POST(request: Request) {
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

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

  try {
    const apiKey = getMailchimpApiKey();
    const audienceId = getMailchimpAudienceId();
    const server = getMailchimpServerPrefix();

    const emailHash = crypto
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    // PUT is idempotent — works for both new and re-subscribing members
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
          status_if_new: "pending", // triggers double opt-in (GDPR)
        }),
        signal: AbortSignal.timeout(10_000), // 10s timeout to prevent hung requests
      }
    );

    const data = await response.json();

    if (!response.ok) {
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
