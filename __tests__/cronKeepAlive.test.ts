import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(async () => [{ ok: 1 }]),
    rateLimit: { deleteMany: vi.fn(async () => ({ count: 0 })) },
  },
}));

import { GET } from "@/app/api/cron/keep-alive/route";

const ORIGINAL = process.env.CRON_SECRET;

function req(auth?: string) {
  return new NextRequest("http://localhost/api/cron/keep-alive", {
    headers: auth ? { authorization: auth } : {},
  });
}

describe("GET /api/cron/keep-alive", () => {
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = ORIGINAL;
  });

  it("returns 401 when CRON_SECRET is not configured (fails closed — audit H6)", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req("Bearer anything"));
    expect(res.status).toBe(401);
  });

  it("returns 401 for a wrong bearer token", async () => {
    process.env.CRON_SECRET = "secret123";
    const res = await GET(req("Bearer wrong"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when the Authorization header is missing", async () => {
    process.env.CRON_SECRET = "secret123";
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("returns 200 with the correct bearer token", async () => {
    process.env.CRON_SECRET = "secret123";
    const res = await GET(req("Bearer secret123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
