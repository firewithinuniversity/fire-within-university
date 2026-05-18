/**
 * lib/rateLimit.ts — Simple in-memory rate limiter
 *
 * Limits how many requests a single IP can make to an API route
 * within a time window. Protects against:
 * - Donation spam (someone submitting 100 $1 charges to drain a card)
 * - Contact form spam
 * - Newsletter signup abuse
 *
 * WHY IN-MEMORY vs. Upstash Redis:
 * In-memory is simpler and works on any host including Vercel serverless.
 * Limitation: each serverless function instance has its own memory, so
 * limits aren't shared across instances (not perfect under high load).
 * For Phase 1 with modest traffic, this is sufficient.
 * Phase 2 can swap in Upstash/Redis for distributed rate limiting.
 *
 * HOW IT WORKS:
 * We keep a Map of IP → array of request timestamps.
 * On each request, we remove timestamps older than the window,
 * then check if the count exceeds the limit.
 */

type RateLimitStore = Map<string, number[]>;

// Module-level store — persists across requests within the same function instance
const store: RateLimitStore = new Map();

// ── Stale entry cleanup ─────────────────────────────────────────────────────
// Periodically sweep out entries with no recent timestamps to prevent
// unbounded memory growth on long-running serverless instances.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries(maxAge: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - maxAge;
  for (const [key, timestamps] of store.entries()) {
    // If the newest timestamp for this key is older than the cutoff, delete it
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

type Options = {
  maxRequests: number;   // e.g. 5
  windowMs: number;      // e.g. 60 * 60 * 1000 (1 hour in ms)
};

/**
 * Returns true if the request should be allowed, false if rate limited.
 *
 * Usage:
 *   const allowed = checkRateLimit(ip, { maxRequests: 3, windowMs: 3600000 });
 *   if (!allowed) return new Response("Too many requests", { status: 429 });
 */
export function checkRateLimit(ip: string, options: Options): boolean {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Run periodic cleanup to free memory from stale keys
  cleanupStaleEntries(windowMs);

  // Get existing timestamps for this IP (or start fresh)
  const timestamps = store.get(ip) ?? [];

  // Remove timestamps outside the current window
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (recentTimestamps.length >= maxRequests) {
    // Store the cleaned-up list (housekeeping)
    store.set(ip, recentTimestamps);
    return false; // rate limited
  }

  // Record this request and allow it
  recentTimestamps.push(now);
  store.set(ip, recentTimestamps);
  return true;
}

/**
 * Extract the real IP from a Next.js request.
 *
 * Priority:
 * 1. x-real-ip — set by Vercel/Nginx; single IP, most reliable
 * 2. x-forwarded-for — set by proxies; first entry is the client IP
 * 3. Fallback — hash of User-Agent + Accept-Language (fingerprint-lite).
 *    Using "unknown" as a fallback is dangerous: all clients without
 *    headers would share a single rate-limit bucket and lock each other out.
 */
export function getIpFromRequest(request: Request): string {
  // Prefer x-real-ip (single value, set by the edge/proxy closest to us)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback to x-forwarded-for (comma-separated; first = real client)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Last resort: combine User-Agent + Accept-Language into a simple hash
  // to avoid every unknown client sharing one rate-limit bucket
  const ua = request.headers.get("user-agent") ?? "";
  const lang = request.headers.get("accept-language") ?? "";
  const raw = `${ua}|${lang}`;
  // Simple djb2-style hash — not crypto-grade, just needs to be deterministic
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0xffffffff;
  }
  return `anon-${hash.toString(36)}`;
}
