import { describe, it, expect, afterEach } from "vitest";
import { getAdminEmails, isAdminEmail } from "@/lib/adminEmails";

const ORIG_1 = process.env.ADMIN_EMAIL_1;
const ORIG_2 = process.env.ADMIN_EMAIL_2;

function setAdmins(a?: string, b?: string) {
  if (a === undefined) delete process.env.ADMIN_EMAIL_1;
  else process.env.ADMIN_EMAIL_1 = a;
  if (b === undefined) delete process.env.ADMIN_EMAIL_2;
  else process.env.ADMIN_EMAIL_2 = b;
}

describe("admin allowlist", () => {
  afterEach(() => {
    setAdmins(ORIG_1, ORIG_2);
  });

  it("recognizes an allowlisted email", () => {
    setAdmins("admin@example.com", "second@example.com");
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("second@example.com")).toBe(true);
  });

  it("rejects a non-allowlisted email", () => {
    setAdmins("admin@example.com");
    expect(isAdminEmail("someone-else@example.com")).toBe(false);
  });

  it("is case-insensitive", () => {
    setAdmins("Admin@Example.com");
    expect(isAdminEmail("ADMIN@EXAMPLE.COM")).toBe(true);
    expect(isAdminEmail("admin@example.com")).toBe(true);
  });

  it("trims surrounding whitespace on both sides", () => {
    setAdmins("  admin@example.com  ");
    expect(isAdminEmail(" admin@example.com ")).toBe(true);
  });

  it("returns false for null/undefined/empty", () => {
    setAdmins("admin@example.com");
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("yields an empty allowlist when no admin emails are configured", () => {
    setAdmins(undefined, undefined);
    expect(getAdminEmails()).toEqual([]);
    expect(isAdminEmail("anyone@example.com")).toBe(false);
  });

  it("reflects env changes at call time (not module load)", () => {
    setAdmins("first@example.com");
    expect(isAdminEmail("first@example.com")).toBe(true);
    expect(isAdminEmail("later@example.com")).toBe(false);
    setAdmins("first@example.com", "later@example.com");
    expect(isAdminEmail("later@example.com")).toBe(true);
  });
});
