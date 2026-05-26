import { describe, it, expect } from "vitest";
import {
  validatePassword,
  isPasswordValid,
  getPasswordErrors,
} from "@/lib/passwordValidation";

describe("validatePassword", () => {
  it("returns 5 criteria for any input", () => {
    const result = validatePassword("");
    expect(result).toHaveLength(5);
    expect(result.map((c) => c.key)).toEqual([
      "length",
      "uppercase",
      "lowercase",
      "number",
      "special",
    ]);
  });

  it("marks all criteria unmet for empty string", () => {
    const result = validatePassword("");
    expect(result.every((c) => !c.met)).toBe(true);
  });

  it("marks all criteria met for a strong password", () => {
    const result = validatePassword("MyP@ssw0rd");
    expect(result.every((c) => c.met)).toBe(true);
  });

  it("detects missing uppercase", () => {
    const result = validatePassword("myp@ssw0rd");
    const uppercase = result.find((c) => c.key === "uppercase");
    expect(uppercase?.met).toBe(false);
  });

  it("detects missing lowercase", () => {
    const result = validatePassword("MYP@SSW0RD");
    const lowercase = result.find((c) => c.key === "lowercase");
    expect(lowercase?.met).toBe(false);
  });

  it("detects missing number", () => {
    const result = validatePassword("MyP@ssword");
    const number = result.find((c) => c.key === "number");
    expect(number?.met).toBe(false);
  });

  it("detects missing special character", () => {
    const result = validatePassword("MyPassw0rd");
    const special = result.find((c) => c.key === "special");
    expect(special?.met).toBe(false);
  });

  it("fails length check for 7 characters", () => {
    const result = validatePassword("Aa1!xyz");
    const length = result.find((c) => c.key === "length");
    expect(length?.met).toBe(false);
  });

  it("passes length check for exactly 8 characters", () => {
    const result = validatePassword("Aa1!xyzz");
    const length = result.find((c) => c.key === "length");
    expect(length?.met).toBe(true);
  });
});

describe("isPasswordValid", () => {
  it("returns true for a valid password", () => {
    expect(isPasswordValid("Strong1!")).toBe(true);
  });

  it("returns false when any criterion is missing", () => {
    expect(isPasswordValid("nouppercase1!")).toBe(false);
    expect(isPasswordValid("NOLOWERCASE1!")).toBe(false);
    expect(isPasswordValid("NoNumber!!")).toBe(false);
    expect(isPasswordValid("NoSpecial1a")).toBe(false);
    expect(isPasswordValid("Sh0!")).toBe(false); // too short
  });
});

describe("getPasswordErrors", () => {
  it("returns empty array for valid password", () => {
    expect(getPasswordErrors("MyP@ssw0rd")).toEqual([]);
  });

  it("returns labels of unmet criteria", () => {
    const errors = getPasswordErrors("short");
    expect(errors).toContain("At least 8 characters");
    expect(errors).toContain("One uppercase letter");
    expect(errors).toContain("One number");
    expect(errors).toContain("One special character (!@#$%^&*...)");
    expect(errors).not.toContain("One lowercase letter");
  });
});
