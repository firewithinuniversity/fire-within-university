import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/emailVerification";

export async function POST(request: Request) {
  const ip = getIpFromRequest(request);
  if (!checkRateLimit(ip, { maxRequests: 3, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "You must be signed in." },
      { status: 401 }
    );
  }

  const email = session.user.email.toLowerCase().trim();

  // Check if already verified
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { message: "Your email is already verified." },
      { status: 400 }
    );
  }

  let sent;
  try {
    sent = await sendVerificationEmail(email);
  } catch {
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
  if (!sent) {
    return NextResponse.json(
      { message: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Verification email sent! Check your inbox.",
  });
}
