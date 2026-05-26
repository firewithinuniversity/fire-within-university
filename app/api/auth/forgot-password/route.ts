import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";
import { getResendApiKey } from "@/lib/env";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(254),
});

// Generic success message — never reveal whether an account exists
const SUCCESS_MSG =
  "If an account with that email exists, we've sent a password reset link.";

export async function POST(request: Request) {
  // Rate limit: 3 requests per hour per IP
  const ip = getIpFromRequest(request);
  if (!checkRateLimit(ip, { maxRequests: 3, windowMs: 60 * 60 * 1000 })) {
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

  const result = ForgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const email = result.data.email.toLowerCase().trim();

  // Always return success — even if account doesn't exist (prevents enumeration)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    // No account or OAuth-only account — silently succeed
    return NextResponse.json({ message: SUCCESS_MSG });
  }

  // Delete any existing tokens for this email
  try {
    await prisma.passwordResetToken.deleteMany({ where: { email } });
  } catch {
    // Non-critical — stale tokens will expire naturally
  }

  // Generate a secure token and store its hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  try {
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });
  } catch (err) {
    console.error("[Forgot Password] Failed to create token:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Send reset email via Resend
  const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  try {
    const resend = new Resend(getResendApiKey());

    await resend.emails.send({
      from: "Fire Within University <noreply@firewithinuniversity.com>",
      to: email,
      subject: "Reset Your Password — Fire Within University",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D1F0A;">
          <h2 style="color: #3D1F0A; margin-bottom: 8px;">Reset Your Password</h2>
          <p>We received a request to reset your password for your Fire Within University account.</p>
          <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background-color: #C45E1A; color: #FDF6EC; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </p>
          <p style="color: #6B3A1F; font-size: 14px;">
            If you didn't request this, you can safely ignore this email. Your password will not be changed.
          </p>
          <hr style="border: none; border-top: 1px solid #E8D1AB; margin: 24px 0;" />
          <p style="color: #6B3A1F; font-size: 12px;">
            If the button doesn't work, copy and paste this URL into your browser:<br />
            <a href="${resetUrl}" style="color: #C45E1A; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[Forgot Password] Failed to send email:", err);
    // Still return success — don't leak that sending failed
  }

  return NextResponse.json({ message: SUCCESS_MSG });
}
