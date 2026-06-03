import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/keep-alive
 *
 * Lightweight ping that keeps the Neon Postgres compute from suspending.
 * Neon free-tier suspends after 5 min of inactivity, causing 1-3s cold
 * starts on the next request. This route runs every 4 minutes via
 * Vercel Cron to prevent that.
 *
 * Protected by CRON_SECRET so it can't be abused by external callers.
 */
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron (or an authorized external pinger).
  // Fail CLOSED: if CRON_SECRET isn't configured, reject everything rather than
  // leaving the DB-touching endpoint publicly callable (audit H6).
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    // Opportunistically sweep expired rate-limit rows so the table stays small.
    await prisma.rateLimit
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {});
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[keep-alive] DB ping failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
