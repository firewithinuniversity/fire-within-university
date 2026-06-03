function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required server environment variable: ${name}\n` +
        `Check your .env.local file and make sure it is set.\n` +
        `See .env.example for all required variables.`
    );
  }
  return value;
}

function requirePublicEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (!value) {
    if (fallback) return fallback;
    console.warn(`[env] Missing ${name} — add it to .env.local (see .env.example). Pages will show empty state.`);
    return "";
  }
  return value;
}

// --- Sanity (public) ---
// Fallbacks provided because NEXT_PUBLIC_ vars must be inlined at build time;
// Vercel can occasionally fail to inject them into the client bundle.
// These are non-secret public identifiers visible in every browser request.
export const SANITY_PROJECT_ID = requirePublicEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "2tgoc0c5"
);
export const SANITY_DATASET = requirePublicEnv(
  "NEXT_PUBLIC_SANITY_DATASET",
  "production"
);

// --- Sanity (server-only — lazy so static builds don't throw) ---
export function getSanityWriteToken(): string {
  return requireServerEnv("SANITY_API_WRITE_TOKEN");
}

// --- Stripe ---
export function getStripeSecretKey(): string {
  return requireServerEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return requireServerEnv("STRIPE_WEBHOOK_SECRET");
}

// --- NextAuth ---
export function getNextAuthSecret(): string {
  const secret = requireServerEnv("NEXTAUTH_SECRET");
  if (secret.length < 32) {
    throw new Error(
      "NEXTAUTH_SECRET must be at least 32 characters for secure JWT signing.\n" +
        "Generate one with: openssl rand -base64 48"
    );
  }
  return secret;
}

// --- Google OAuth ---
export function getGoogleClientId(): string {
  return requireServerEnv("GOOGLE_CLIENT_ID");
}

export function getGoogleClientSecret(): string {
  return requireServerEnv("GOOGLE_CLIENT_SECRET");
}

// --- Database ---
export function getDatabaseUrl(): string {
  return requireServerEnv("DATABASE_URL");
}

// --- Admin emails (optional) ---
export function getAdminEmail1(): string | undefined {
  return process.env.ADMIN_EMAIL_1 || undefined;
}

export function getAdminEmail2(): string | undefined {
  return process.env.ADMIN_EMAIL_2 || undefined;
}

// --- Google Analytics ---
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

// --- Contact form ---
export function getContactFormEmail(): string {
  return requireServerEnv("CONTACT_FORM_EMAIL");
}

export function getResendApiKey(): string {
  return requireServerEnv("RESEND_API_KEY");
}
