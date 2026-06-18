/**
 * src/lib/rateLimiter.ts
 *
 * Simple in-memory token-bucket limiter suitable for single-instance
 * deployments and development. For multi-instance production deployments
 * replace with Upstash / Redis.
 */

interface BucketEntry {
  tokens: number;
  lastRefill: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20; // per window per IP

const store = new Map<string, BucketEntry>();

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(request: Request): RateLimitResult {
  const ip = getIp(request);
  const now = Date.now();

  let entry = store.get(ip);

  if (!entry || now - entry.lastRefill > WINDOW_MS) {
    entry = { tokens: MAX_REQUESTS, lastRefill: now };
  }

  if (entry.tokens <= 0) {
    store.set(ip, entry);
    return { allowed: false, remaining: 0 };
  }

  entry.tokens -= 1;
  store.set(ip, entry);

  return { allowed: true, remaining: entry.tokens };
}

// Prevent memory leaks in long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now - entry.lastRefill > WINDOW_MS * 2) {
      store.delete(ip);
    }
  }
}, WINDOW_MS * 5);
