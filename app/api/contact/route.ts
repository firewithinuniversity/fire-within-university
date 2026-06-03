import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getIpFromRequest } from "@/lib/rateLimit";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { getContactFormEmail, getResendApiKey } from "@/lib/env";
import { EMAIL_CONTACT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const ContactSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase().trim(),
  subject: z.enum(["general", "prayer", "other"]),
  message: z.string().min(10).max(2000).trim(),
  website: z.string().max(0, "Bot detected"), // honeypot — must be empty
});

// Entity-encode instead of strip — regex-based tag removal is bypassable
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const MAX_BODY_SIZE = 10 * 1024; // 10KB — contact forms are small

export async function POST(request: Request) {
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  const ip = getIpFromRequest(request);
  const allowed = await checkRateLimitDb(ip, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 per hour
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (rawText.length > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Please check your form and try again." },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = result.data;

  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);

  const subjectLabels: Record<string, string> = {
    general: "General Contact",
    prayer: "Prayer Request",
    other: "Other Inquiry",
  };

  try {
    await prisma.contactSubmission.create({
      data: { name, email, subject, message },
    });
  } catch (err) {
    console.error("[Contact DB Error]", err instanceof Error ? err.message : "Unknown error");
  }

  try {
    const resend = new Resend(getResendApiKey());

    await resend.emails.send({
      from: `Fire Within University <${EMAIL_CONTACT}>`,
      to: getContactFormEmail(),
      replyTo: email,
      subject: `[${subjectLabels[subject]}] from ${safeName}`,
      text: `${subjectLabels[subject]}\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D1F0A;">${subjectLabels[subject]}</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Type:</strong> ${subjectLabels[subject]}</p>
          <hr style="border-color: #C45E1A; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #6B3A1F;">${safeMessage}</p>
        </div>
      `,
    });

    return NextResponse.json({
      message:
        subject === "prayer"
          ? "Your prayer request has been received. We will be praying for you."
          : "Your message has been sent. We'll be in touch soon.",
    });
  } catch (error) {
    console.error("[Contact Form Error]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }
}
