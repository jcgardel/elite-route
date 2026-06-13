import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let mapsLimiter: Ratelimit | null = null;
let checkoutLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  // Vercel KV integration uses KV_REST_API_URL / KV_REST_API_TOKEN
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function getMapsLimiter(): Ratelimit | null {
  if (mapsLimiter) return mapsLimiter;
  const redis = getRedis();
  if (!redis) return null;
  mapsLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:maps",
  });
  return mapsLimiter;
}

export function getCheckoutLimiter(): Ratelimit | null {
  if (checkoutLimiter) return checkoutLimiter;
  const redis = getRedis();
  if (!redis) return null;
  checkoutLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:checkout",
  });
  return checkoutLimiter;
}

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
