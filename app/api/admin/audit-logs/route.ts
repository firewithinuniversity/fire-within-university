import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const VALID_EVENTS = [
  "ADMIN_LOGIN_SUCCESS",
  "ADMIN_LOGIN_FAILURE",
  "ADMIN_ACCESS_DENIED",
  "ADMIN_REGISTER_BLOCKED",
  "LOGIN_RATE_LIMITED",
] as const;

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "30") || 30));
  const skip = (page - 1) * limit;
  const eventParam = searchParams.get("event");
  const event = VALID_EVENTS.includes(eventParam as (typeof VALID_EVENTS)[number])
    ? eventParam
    : null;

  const where = event ? { event } : {};

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch (err) {
    console.error("[Admin Audit Logs] Database error:", err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
