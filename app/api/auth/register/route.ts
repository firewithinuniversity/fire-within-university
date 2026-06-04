import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getIpFromRequest } from "@/lib/rateLimit";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { isAdminEmail } from "@/lib/adminEmails";
import { isPasswordValid, getPasswordErrors } from "@/lib/passwordValidation";
import { logAuditEvent } from "@/lib/auditLog";
import { sendVerificationEmail } from "@/lib/emailVerification";

const MAX_BODY_SIZE = 2 * 1024; // 2 KB

export async function POST(request: Request) {
  const ip = getIpFromRequest(request);
  if (!(await checkRateLimitDb(ip, { maxRequests: 5, windowMs: 60 * 60 * 1000 }))) {
    return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
  }

  // Reject oversized payloads
  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  if (typeof name === "string" && name.trim().length > 100) {
    return NextResponse.json({ message: "Name is too long." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }

  if (!isPasswordValid(password)) {
    const errors = getPasswordErrors(password);
    return NextResponse.json(
      { message: `Password requirements not met: ${errors.join(", ")}.` },
      { status: 400 },
    );
  }

  if (isAdminEmail(normalizedEmail)) {
    logAuditEvent({
      event: "ADMIN_REGISTER_BLOCKED",
      email: normalizedEmail,
      ip,
      metadata: { reason: "admin_email_registration_attempt" },
    });
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name?.trim().slice(0, 100) || null,
        email: normalizedEmail,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Send verification email (fire-and-forget — don't block registration)
    sendVerificationEmail(normalizedEmail).catch((err) => {
      console.error("[Register] Failed to send verification email:", err instanceof Error ? err.message : "Unknown error");
    });

    return NextResponse.json({ message: "Account created successfully. Please check your email to verify your address." }, { status: 201 });
  } catch (err) {
    // Unique-constraint violation = a concurrent request already created this
    // account (check-then-create race). Treat it as "already exists", not 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }
    console.error("[Register] Database error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
