import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn().mockResolvedValue({ id: "test-id" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: mockCreate,
    },
  },
}));

import { logAuditEvent } from "@/lib/auditLog";

describe("logAuditEvent", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("calls prisma.auditLog.create with correct data", async () => {
    await logAuditEvent({
      event: "ADMIN_LOGIN_SUCCESS",
      email: "test@example.com",
      userId: "user-123",
      ip: "127.0.0.1",
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        event: "ADMIN_LOGIN_SUCCESS",
        email: "test@example.com",
        userId: "user-123",
        ip: "127.0.0.1",
        userAgent: null,
        metadata: null,
      },
    });
  });

  it("handles missing optional fields with nulls", async () => {
    await logAuditEvent({ event: "ADMIN_ACCESS_DENIED" });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        event: "ADMIN_ACCESS_DENIED",
        email: null,
        userId: null,
        ip: null,
        userAgent: null,
        metadata: null,
      },
    });
  });

  it("serializes metadata to JSON string", async () => {
    await logAuditEvent({
      event: "ADMIN_LOGIN_FAILURE",
      metadata: { reason: "test", count: 42 },
    });

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.metadata).toBe('{"reason":"test","count":42}');
  });

  it("does not throw on database error (fire-and-forget)", async () => {
    mockCreate.mockRejectedValueOnce(new Error("DB down"));

    await expect(
      logAuditEvent({ event: "LOGIN_RATE_LIMITED" })
    ).resolves.toBeUndefined();
  });
});
