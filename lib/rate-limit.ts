/**
 * In-memory per-IP rate limiter.
 * Note: Each Cloud Run instance has its own counter.
 * Set --max-instances to cap total spend.
 */

interface RateLimitEntry {
  minuteCount: number;
  hourCount: number;
  minuteResetAt: number;
  hourResetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN ?? "20", 10);
const PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR ?? "60", 10);

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (now > entry.hourResetAt) {
        store.delete(ip);
      }
    }
  },
  10 * 60 * 1000
);

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const minuteWindow = 60 * 1000;
  const hourWindow = 60 * 60 * 1000;

  let entry = store.get(ip);

  if (!entry) {
    entry = {
      minuteCount: 0,
      hourCount: 0,
      minuteResetAt: now + minuteWindow,
      hourResetAt: now + hourWindow,
    };
    store.set(ip, entry);
  }

  // Reset counters if windows expired
  if (now > entry.minuteResetAt) {
    entry.minuteCount = 0;
    entry.minuteResetAt = now + minuteWindow;
  }
  if (now > entry.hourResetAt) {
    entry.hourCount = 0;
    entry.hourResetAt = now + hourWindow;
  }

  // Check limits
  if (entry.minuteCount >= PER_MIN) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.minuteResetAt - now) / 1000),
    };
  }
  if (entry.hourCount >= PER_HOUR) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.hourResetAt - now) / 1000),
    };
  }

  entry.minuteCount++;
  entry.hourCount++;

  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
