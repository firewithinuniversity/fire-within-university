/**
 * app/api/contact/route.ts — Contact and prayer request form handler
 *
 * Receives the form submission, validates it, and sends an email via Resend.
 *
 * SECURITY MEASURES:
 * 1. Rate limiting — max 3 submissions per IP per hour (prevents spam)
 * 2. Zod validation — validates and sanitizes all fields
 * 3. Honeypot check — rejects any submission where the hidden field is filled
 *    (bots fill all fields; real users never touch hidden ones)
 * 4. Input sanitization — strips HTML tags before putting content in email
 * 5. Generic error messages — never exposes server internals to client
 * 6. Transactional email service — Resend, not direct SMTP
 *    (your personal email address is never in the codebase)
 *
 * WHY RESEND vs. direct SMTP:
 * - Your email address stays in Vercel environment variables, not code
 * - Resend handles deliverability, DKIM, SPF automatically
 * - Better logging and debugging than raw SMTP
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";
import { getContactFormEmail, getResendApiKey } from "@/lib/env";
import { prisma } from "@/lib/prisma";

// ── Input validation schema ───────────────────────────────────────────────────
const ContactSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254),
  subject: z.enum(["general", "prayer", "other"]),
  message: z.string().min(10).max(2000).trim(),
  // Honeypot field — must be empty. Bots fill everything; humans don't see this.
  // The field is named something innocuous that bots want to fill ("website").
  website: z.string().max(0, "Bot detected"), // must be empty string
});

/**
 * Escape HTML special characters to prevent injection in the email body.
 * WHY escapeHtml instead of stripHtml:
 * stripHtml (regex-based tag removal) is unreliable — crafted strings like
 * `<scr<script>ipt>` can bypass the regex. Entity-encoding is fool-proof:
 * the characters are preserved visually but rendered inert by email clients.
 */
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
  // ── Body size limit (DoS protection) ──────────────────────────────────────
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getIpFromRequest(request);
  const allowed = checkRateLimit(ip, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 per hour
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ── Parse and validate ────────────────────────────────────────────────────
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
    // Don't expose which field failed — generic message only
    return NextResponse.json(
      { message: "Please check your form and try again." },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = result.data;
  // Honeypot is already validated as empty by Zod (max(0) means empty string required)

  // ── Sanitize inputs before using in email ─────────────────────────────────
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);

  const subjectLabels: Record<string, string> = {
    general: "General Contact",
    prayer: "Prayer Request",
    other: "Other Inquiry",
  };

  // ── Persist to database ────────────────────────────────────────────────────
  try {
    await prisma.contactSubmission.create({
      data: { name, email, subject, message },
    });
  } catch (err) {
    console.error("[Contact DB Error]", err);
  }

  // ── Send email via Resend ─────────────────────────────────────────────────
  try {
    const resend = new Resend(getResendApiKey());

    await resend.emails.send({
      // "from" must be a verified domain in Resend dashboard
      from: "Fire Within University <contact@firewithinuniversity.com>",
      to: getContactFormEmail(),
      replyTo: email, // replying goes to the person who submitted the form
      subject: `[${subjectLabels[subject]}] from ${safeName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D1F0A;">${subjectLabels[subject]}</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${email}</p>
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
    console.error("[Contact Form Error]", error);
    return NextResponse.json(
      { message: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }
}
