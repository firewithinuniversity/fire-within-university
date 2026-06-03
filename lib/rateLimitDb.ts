import { prisma } from "@/lib/prisma";

type Options = {
  maxRequests: number; // e.g. 5
  windowMs: number; // e.g. 15 * 60 * 1000
};

/**
 * Database-backed fixed-window rate limiter.
 *
 * Unlike the in-memory limiter (lib/rateLimit.ts), this shares state across all
 * serverless instances and survives cold starts, so the configured limits are
 * actually enforced on Vercel (audit H2).
 *
 * Fails OPEN on DB errors: a database hiccup must never lock legitimate users
 * out of login/registration. The in-memory limiter remains as a second layer.
 */
export async function checkRateLimitDb(
  key: string,
  options: Options
): Promise<boolean> {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const compositeKey = `${key}:${windowStart}`;
  const expiresAt = new Date(windowStart + windowMs);

  try {
    const record = await prisma.rateLimit.upsert({
      where: { key: compositeKey },
      create: { key: compositeKey, count: 1, expiresAt },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    return record.count <= maxRequests;
  } catch (err) {
    console.error(
      "[rateLimitDb] error (failing open):",
      err instanceof Error ? err.message : String(err)
    );
    return true; // fail open
  }
}
