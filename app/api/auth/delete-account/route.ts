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
    // Prisma cascade deletes (via onDelete: Cascade) remove:
    // - Account (OAuth links), Session, LessonProgress, Bookmark
    // (Contact submissions, donation records, and audit logs are intentionally
    // retained — see the Privacy Policy retention section.)
    //
    // The account deletion is the only step that MUST succeed (right-to-erasure).
    // Token cleanup is best-effort: a transient error on the token tables must
    // not roll back the user deletion. We also fetch the canonical email from
    // the DB rather than trusting JWT casing.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    await prisma.user.delete({ where: { id: session.user.id } });

    // Best-effort: normalize to match the lowercased rows written elsewhere.
    const email = user?.email?.toLowerCase().trim();
    if (email) {
      try {
        await prisma.$transaction([
          prisma.passwordResetToken.deleteMany({ where: { email } }),
          prisma.verificationToken.deleteMany({ where: { identifier: email } }),
        ]);
      } catch (tokenErr) {
        console.error(
          "[Delete Account] Token cleanup failed (account still deleted):",
          tokenErr instanceof Error ? tokenErr.message : "Unknown error"
        );
      }
    }

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
