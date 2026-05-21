import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;
  const unreadOnly = searchParams.get("unread") === "true";

  const where = unreadOnly ? { read: false } : {};

  const [submissions, total, unreadCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ submissions, total, unreadCount, page, limit });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { id?: string; read?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  if (!body.id || typeof body.read !== "boolean") {
    return NextResponse.json({ message: "id and read are required." }, { status: 400 });
  }

  if (!/^c[a-z0-9]{24}$/.test(body.id)) {
    return NextResponse.json({ message: "Invalid id format." }, { status: 400 });
  }

  const existing = await prisma.contactSubmission.findUnique({ where: { id: body.id } });
  if (!existing) {
    return NextResponse.json({ message: "Submission not found." }, { status: 404 });
  }

  const updated = await prisma.contactSubmission.update({
    where: { id: body.id },
    data: { read: body.read },
  });

  return NextResponse.json({ submission: updated });
}
