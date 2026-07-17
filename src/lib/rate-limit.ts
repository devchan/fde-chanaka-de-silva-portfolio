/**
 * Minimal in-memory sliding-window rate limiter. Server-only, per-process —
 * appropriate for the single-instance admin surface (login brute-force blunting).
 * For a multi-replica deployment this would move to Redis.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= limit) {
    const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
    return { ok: false, retryAfter };
  }
  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}

export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || request.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
