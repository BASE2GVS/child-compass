const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** In-memory rate limiter for server actions. Replace with Redis/Upstash for multi-instance production. */
export function checkRateLimit(key: string, max = MAX_REQUESTS, windowMs = WINDOW_MS): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}

export async function rateLimitUserAction(userId: string, action: string): Promise<{ error?: string }> {
  const result = checkRateLimit(`${userId}:${action}`);
  if (!result.allowed) {
    return { error: "Too many requests. Please wait a moment and try again." };
  }
  return {};
}
