import { getAdminEmail1, getAdminEmail2 } from "@/lib/env";

/**
 * The admin allowlist — the security boundary for the admin portal.
 *
 * Admin status is derived from this allowlist (env: ADMIN_EMAIL_1/2) and
 * re-checked on every request from the signed JWT, so a non-allowlisted email
 * can never hold the ADMIN role. Kept Prisma-free so it can be unit-tested in
 * isolation.
 *
 * Read at call time (not module load) so it reflects the current environment.
 */
export function getAdminEmails(): string[] {
  return [getAdminEmail1(), getAdminEmail2()]
    .filter((e): e is string => Boolean(e))
    .map((e) => e.trim().toLowerCase());
}

/** True if the given email is on the admin allowlist (case/whitespace-insensitive). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
