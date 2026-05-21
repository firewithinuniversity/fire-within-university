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

function requirePublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required public environment variable: ${name}\n` +
          `Set it in the Vercel dashboard or your deployment environment.`
      );
    }
    console.warn(`[env] Missing ${name} — add it to .env.local (see .env.example). Pages will show empty state.`);
    return "";
  }
  return value;
}

// --- Sanity (public) ---
export const SANITY_PROJECT_ID = requirePublicEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
);
export const SANITY_DATASET = requirePublicEnv("NEXT_PUBLIC_SANITY_DATASET");

// --- Sanity (server-only — lazy so static builds don't throw) ---
export function getSanityReadToken(): string {
  return requireServerEnv("SANITY_API_READ_TOKEN");
}

export function getSanityWriteToken(): string {
  return requireServerEnv("SANITY_API_WRITE_TOKEN");
}

export function getSanityPreviewSecret(): string {
  return requireServerEnv("SANITY_PREVIEW_SECRET");
}

// --- Stripe ---
export const STRIPE_PUBLISHABLE_KEY = requirePublicEnv(
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
);

export function getStripeSecretKey(): string {
  return requireServerEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return requireServerEnv("STRIPE_WEBHOOK_SECRET");
}

// --- Mailchimp ---
export function getMailchimpApiKey(): string {
  return requireServerEnv("MAILCHIMP_API_KEY");
}

export function getMailchimpAudienceId(): string {
  return requireServerEnv("MAILCHIMP_AUDIENCE_ID");
}

export function getMailchimpServerPrefix(): string {
  return requireServerEnv("MAILCHIMP_SERVER_PREFIX");
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
