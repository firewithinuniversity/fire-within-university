import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const ip = getIpFromRequest(request);
  if (!checkRateLimit(`profile:${ip}`, { maxRequests: 10, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = UpdateProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Name must be between 1 and 100 characters." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: result.data.name },
      select: { name: true },
    });

    return NextResponse.json({ name: user.name });
  } catch (err) {
    console.error("[Update Profile] Database error:", err);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
