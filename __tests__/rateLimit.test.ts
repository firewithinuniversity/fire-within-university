import { describe, it, expect, vi, beforeEach } from "vitest";

// Reset module state between tests by re-importing
let checkRateLimit: typeof import("@/lib/rateLimit").checkRateLimit;
let getIpFromRequest: typeof import("@/lib/rateLimit").getIpFromRequest;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("@/lib/rateLimit");
  checkRateLimit = mod.checkRateLimit;
  getIpFromRequest = mod.getIpFromRequest;
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const opts = { maxRequests: 3, windowMs: 60_000 };
    expect(checkRateLimit("1.2.3.4", opts)).toBe(true);
    expect(checkRateLimit("1.2.3.4", opts)).toBe(true);
    expect(checkRateLimit("1.2.3.4", opts)).toBe(true);
  });

  it("blocks requests at the limit", () => {
    const opts = { maxRequests: 2, windowMs: 60_000 };
    expect(checkRateLimit("1.2.3.4", opts)).toBe(true);
    expect(checkRateLimit("1.2.3.4", opts)).toBe(true);
    expect(checkRateLimit("1.2.3.4", opts)).toBe(false);
  });

  it("tracks IPs independently", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };
    expect(checkRateLimit("1.1.1.1", opts)).toBe(true);
    expect(checkRateLimit("2.2.2.2", opts)).toBe(true);
    expect(checkRateLimit("1.1.1.1", opts)).toBe(false);
    expect(checkRateLimit("2.2.2.2", opts)).toBe(false);
  });

  it("resets after the time window elapses", () => {
    const opts = { maxRequests: 1, windowMs: 1_000 };

    vi.useFakeTimers();
    expect(checkRateLimit("5.5.5.5", opts)).toBe(true);
    expect(checkRateLimit("5.5.5.5", opts)).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(1_500);
    expect(checkRateLimit("5.5.5.5", opts)).toBe(true);
    vi.useRealTimers();
  });
});

describe("getIpFromRequest", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request("http://localhost", {
      headers: new Headers(headers),
    });
  }

  it("prefers x-real-ip header", () => {
    const req = makeRequest({
      "x-real-ip": "10.0.0.1",
      "x-forwarded-for": "10.0.0.2, 10.0.0.3",
    });
    expect(getIpFromRequest(req)).toBe("10.0.0.1");
  });

  it("falls back to first x-forwarded-for IP", () => {
    const req = makeRequest({
      "x-forwarded-for": "192.168.1.1, 10.0.0.1",
    });
    expect(getIpFromRequest(req)).toBe("192.168.1.1");
  });

  it("trims whitespace from forwarded IPs", () => {
    const req = makeRequest({
      "x-forwarded-for": "  192.168.1.1 , 10.0.0.1 ",
    });
    expect(getIpFromRequest(req)).toBe("192.168.1.1");
  });

  it("generates deterministic hash for anonymous clients", () => {
    const req1 = makeRequest({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US",
    });
    const req2 = makeRequest({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US",
    });
    const ip1 = getIpFromRequest(req1);
    const ip2 = getIpFromRequest(req2);
    expect(ip1).toBe(ip2);
    expect(ip1).toMatch(/^anon-/);
  });

  it("generates different hashes for different user agents", () => {
    const req1 = makeRequest({ "user-agent": "Chrome/120" });
    const req2 = makeRequest({ "user-agent": "Firefox/121" });
    expect(getIpFromRequest(req1)).not.toBe(getIpFromRequest(req2));
  });
});
