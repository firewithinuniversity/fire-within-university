import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpFromRequest(request);
  if (!checkRateLimit(ip, { maxRequests: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });

  return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
}
