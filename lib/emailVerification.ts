import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getResendApiKey } from "@/lib/env";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a verification token, store its hash, and send the verification email.
 * Returns true on success, false on failure (never throws).
 */
export async function sendVerificationEmail(email: string): Promise<boolean> {
  // Delete any existing tokens for this email
  try {
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
  } catch {
    // Non-critical
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  try {
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });
  } catch (err) {
    console.error("[Email Verification] Failed to create token:", err);
    return false;
  }

  const verifyUrl = `${BASE_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

  try {
    const resend = new Resend(getResendApiKey());

    await resend.emails.send({
      from: "Fire Within University <noreply@firewithinuniversity.com>",
      to: email,
      subject: "Verify Your Email — Fire Within University",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D1F0A;">
          <h2 style="color: #3D1F0A; margin-bottom: 8px;">Welcome to Fire Within University!</h2>
          <p>Thanks for creating an account. Please verify your email address to get the most out of your experience.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="display: inline-block; background-color: #C45E1A; color: #FDF6EC; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Verify Email
            </a>
          </p>
          <p style="color: #6B3A1F; font-size: 14px;">
            This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E8D1AB; margin: 24px 0;" />
          <p style="color: #6B3A1F; font-size: 12px;">
            If the button doesn't work, copy and paste this URL into your browser:<br />
            <a href="${verifyUrl}" style="color: #C45E1A; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
      `,
    });

    return true;
  } catch (err) {
    console.error("[Email Verification] Failed to send email:", err);
    return false;
  }
}
