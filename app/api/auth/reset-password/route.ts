import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getIpFromRequest } from "@/lib/rateLimit";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { isPasswordValid } from "@/lib/passwordValidation";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  // Rate limit: 5 attempts per 15 minutes per IP
  const ip = getIpFromRequest(request);
  if (!(await checkRateLimitDb(ip, { maxRequests: 5, windowMs: 15 * 60 * 1000 }))) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = ResetPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid request. Please try the reset link again." },
      { status: 400 }
    );
  }

  const { token, email: rawEmail, password } = result.data;
  const email = rawEmail.toLowerCase().trim();

  // Validate password strength
  if (!isPasswordValid(password)) {
    return NextResponse.json(
      { message: "Password does not meet the requirements." },
      { status: 400 }
    );
  }

  // Hash the provided token to compare against stored hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Look up the token
  let storedToken;
  try {
    storedToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });
  } catch (err) {
    console.error("[Reset Password] DB lookup error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!storedToken) {
    return NextResponse.json(
      { message: "This reset link is invalid or has already been used." },
      { status: 400 }
    );
  }

  // Check expiry
  if (storedToken.expires < new Date()) {
    // Clean up expired token
    await prisma.passwordResetToken.delete({ where: { id: storedToken.id } }).catch(() => {});
    return NextResponse.json(
      { message: "This reset link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  // Verify email matches
  if (storedToken.email !== email) {
    return NextResponse.json(
      { message: "This reset link is invalid." },
      { status: 400 }
    );
  }

  // Find the user
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
  if (!user) {
    return NextResponse.json(
      { message: "This reset link is invalid." },
      { status: 400 }
    );
  }

  // Update the password
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      // Delete ALL tokens for this email (one-time use)
      prisma.passwordResetToken.deleteMany({ where: { email } }),
    ]);
  } catch (err) {
    console.error("[Reset Password] Failed to update password:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Your password has been reset successfully. You can now sign in.",
  });
}
