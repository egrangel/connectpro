import { beforeEach, describe, expect, test, vi } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

const RULE = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useRealTimers();
  });

  test("allows requests up to the limit", () => {
    expect(checkRateLimit("k", RULE)).toBe(true);
    expect(checkRateLimit("k", RULE)).toBe(true);
    expect(checkRateLimit("k", RULE)).toBe(true);
  });

  test("blocks the request after the limit within the window", () => {
    for (let i = 0; i < RULE.limit; i += 1) checkRateLimit("k", RULE);
    expect(checkRateLimit("k", RULE)).toBe(false);
  });

  test("tracks keys independently", () => {
    for (let i = 0; i < RULE.limit; i += 1) checkRateLimit("a", RULE);
    expect(checkRateLimit("a", RULE)).toBe(false);
    expect(checkRateLimit("b", RULE)).toBe(true);
  });

  test("resets after the window elapses", () => {
    vi.useFakeTimers();
    for (let i = 0; i < RULE.limit; i += 1) checkRateLimit("k", RULE);
    expect(checkRateLimit("k", RULE)).toBe(false);

    vi.advanceTimersByTime(RULE.windowMs + 1);
    expect(checkRateLimit("k", RULE)).toBe(true);
  });
});
