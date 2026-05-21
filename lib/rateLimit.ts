type RateLimitStore = Map<string, number[]>;

const store: RateLimitStore = new Map();

// Periodic sweep to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries(maxAge: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - maxAge;
  for (const [key, timestamps] of store.entries()) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

type Options = {
  maxRequests: number;   // e.g. 5
  windowMs: number;      // e.g. 60 * 60 * 1000 (1 hour in ms)
};

export function checkRateLimit(ip: string, options: Options): boolean {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  cleanupStaleEntries(windowMs);

  const timestamps = store.get(ip) ?? [];
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (recentTimestamps.length >= maxRequests) {
    store.set(ip, recentTimestamps);
    return false;
  }

  recentTimestamps.push(now);
  store.set(ip, recentTimestamps);
  return true;
}

export function getIpFromRequest(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Hash UA + language to avoid all unknown clients sharing one bucket
  const ua = request.headers.get("user-agent") ?? "";
  const lang = request.headers.get("accept-language") ?? "";
  const raw = `${ua}|${lang}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0xffffffff;
  }
  return `anon-${hash.toString(36)}`;
}
