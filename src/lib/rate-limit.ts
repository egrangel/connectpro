// In-memory fixed-window rate limiter. Adequate for a single-process
// deployment; swap the backing store for Redis when scaling horizontally
// (docs/ARCHITECTURE.md §13).

interface WindowState {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowState>();

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  review: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>;

/** Returns true when the action is allowed, false when rate-limited. */
export function checkRateLimit(key: string, rule: RateLimitRule): boolean {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }
  if (current.count >= rule.limit) {
    return false;
  }
  windows.set(key, { count: current.count + 1, resetAt: current.resetAt });
  return true;
}

/** Test helper. */
export function resetRateLimits(): void {
  windows.clear();
}
