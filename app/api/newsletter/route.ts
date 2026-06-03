import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getIpFromRequest } from "@/lib/rateLimit";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { getResendApiKey } from "@/lib/env";

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
  const allowed = await checkRateLimitDb(ip, {
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
    const resend = new Resend(getResendApiKey());

    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (error) {
      // Resend returns a specific error if the contact already exists
      if (error.message?.includes("already exists")) {
        return NextResponse.json({
          message: "You're already subscribed — thanks for being here!",
        });
      }

      console.error("[Resend Contacts Error]", error.message);
      return NextResponse.json(
        { message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "You're subscribed! Welcome to the Fire Within community.",
    });
  } catch (error) {
    console.error(
      "[Newsletter Signup Error]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
