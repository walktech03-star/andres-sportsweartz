// A small in-memory rate limiter.
//
// WHY: without it, a script could submit thousands of fake orders.
//
// IMPORTANT LIMITATION - READ THIS:
// This counter lives in the memory of a single running server.
//   * It resets whenever the website is redeployed or restarted.
//   * On hosting that runs several copies of the server, each copy has its
//     own counter, so the effective limit is higher than the number below.
// It is still useful protection against casual abuse. For stronger, permanent
// protection later, store the counters in the database or use a hosted
// rate-limiting service.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Prevent the map from growing forever on a busy site.
const MAX_TRACKED_KEYS = 10000;

function sweep(now: number) {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

// Best-effort identification of the person making the request.
// Hosting providers add these headers automatically.
export function clientKeyFromRequest(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}