import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

const VerifyEmailSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().max(254),
});

export async function GET(request: Request) {
  const ip = getIpFromRequest(request);
  if (!checkRateLimit(ip, { maxRequests: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const raw = {
    token: searchParams.get("token") ?? "",
    email: searchParams.get("email") ?? "",
  };

  const result = VerifyEmailSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid verification link." },
      { status: 400 }
    );
  }

  const { token, email: rawEmail } = result.data;
  const email = rawEmail.toLowerCase().trim();

  // Hash the raw token to compare against stored hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  let storedToken;
  try {
    storedToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });
  } catch (err) {
    console.error("[Verify Email] DB lookup error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!storedToken) {
    return NextResponse.json(
      { message: "This verification link is invalid or has already been used." },
      { status: 400 }
    );
  }

  // Check expiry
  if (storedToken.expires < new Date()) {
    await prisma.verificationToken
      .delete({
        where: {
          identifier_token: {
            identifier: storedToken.identifier,
            token: hashedToken,
          },
        },
      })
      .catch(() => {});
    return NextResponse.json(
      { message: "This verification link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  // Verify email matches the token's identifier
  if (storedToken.identifier !== email) {
    return NextResponse.json(
      { message: "This verification link is invalid." },
      { status: 400 }
    );
  }

  // Find the user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { message: "This verification link is invalid." },
      { status: 400 }
    );
  }

  // Update emailVerified and delete the token in a transaction
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: email },
      }),
    ]);
  } catch (err) {
    console.error("[Verify Email] Failed to verify:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Your email has been verified successfully!",
  });
}
