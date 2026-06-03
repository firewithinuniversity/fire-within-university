import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

const DeleteSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  // Prevent admin accounts from self-deleting via this endpoint
  if (session.user.role === "ADMIN") {
    return NextResponse.json(
      { message: "Admin accounts cannot be deleted through this form." },
      { status: 403 }
    );
  }

  const ip = getIpFromRequest(request);
  if (
    !checkRateLimit(`delete-account:${ip}`, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 3 per hour
    })
  ) {
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

  const result = DeleteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Please type DELETE to confirm." },
      { status: 400 }
    );
  }

  try {
    const email = session.user.email ?? undefined;

    // Prisma cascade deletes (via onDelete: Cascade) remove:
    // - Account (OAuth links), Session, LessonProgress, Bookmark
    // We also clear email-keyed auth tokens that aren't linked by a foreign key.
    // (Contact submissions, donation records, and audit logs are intentionally
    // retained — see the Privacy Policy retention section.)
    await prisma.$transaction([
      prisma.user.delete({ where: { id: session.user.id } }),
      ...(email
        ? [
            prisma.passwordResetToken.deleteMany({ where: { email } }),
            prisma.verificationToken.deleteMany({ where: { identifier: email } }),
          ]
        : []),
    ]);

    return NextResponse.json({
      message: "Your account has been deleted.",
    });
  } catch (err) {
    console.error(
      "[Delete Account] Database error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
