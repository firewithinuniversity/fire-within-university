export interface PasswordCriterion {
  key: string;
  label: string;
  met: boolean;
}

export function validatePassword(password: string): PasswordCriterion[] {
  return [
    {
      key: "length",
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      key: "uppercase",
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "One lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "One number",
      met: /\d/.test(password),
    },
    {
      key: "special",
      label: "One special character (!@#$%^&*...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return validatePassword(password).every((c) => c.met);
}

export function getPasswordErrors(password: string): string[] {
  return validatePassword(password)
    .filter((c) => !c.met)
    .map((c) => c.label);
}
