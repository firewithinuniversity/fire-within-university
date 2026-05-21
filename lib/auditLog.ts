import { prisma } from "@/lib/prisma";

type AuditEvent =
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_LOGIN_FAILURE"
  | "ADMIN_ACCESS_DENIED"
  | "ADMIN_REGISTER_BLOCKED"
  | "LOGIN_RATE_LIMITED";

type AuditPayload = {
  event: AuditEvent;
  email?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event: payload.event,
        email: payload.email ?? null,
        userId: payload.userId ?? null,
        ip: payload.ip ?? null,
        userAgent: payload.userAgent ?? null,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit event:", err);
  }
}
