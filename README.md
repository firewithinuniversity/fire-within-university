# Fire Within University

A ministry & education platform — sermons, articles, courses, and donations — for
**The Fire Within LLC** (operating as Fire Within University).

Production: https://www.firewithinuniversity.com

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS 3 (custom brown/gold/cream theme) |
| Auth | NextAuth 4 (JWT) — Google OAuth + email/password (bcrypt) |
| Database | Prisma 5 + Neon PostgreSQL |
| CMS | Sanity v5 — embedded Studio at `/studio` |
| Email | Resend — transactional + newsletter contacts |
| Payments | Stripe Checkout (donations) |
| Hosting | Vercel |
| Tests | Vitest · Playwright (e2e) |

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values (see below)
npx prisma generate
npm run dev                  # http://localhost:3000
```

`prisma generate` runs automatically as part of `npm run build`. To sync schema
changes to the database during development, use `npx prisma db push`.

### Environment variables

All variables are documented in [`.env.example`](./.env.example). Summary:

- **Sanity** — `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_WRITE_TOKEN`
- **Stripe** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Auth** — `NEXTAUTH_SECRET` (≥32 chars), `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Admins** — `ADMIN_EMAIL_1/2` (allowlist; these emails are granted the ADMIN role on login)
- **Database** — `DATABASE_URL` (Neon Postgres)
- **Email** — `RESEND_API_KEY`, `CONTACT_FORM_EMAIL`
- **Analytics** — `NEXT_PUBLIC_GA_ID`
- **Site** — `NEXT_PUBLIC_BASE_URL` (production origin)
- **Cron** — `CRON_SECRET` (protects `/api/cron/*`)

Secrets live only in `.env.local` (gitignored) and Vercel env settings — never commit them.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright end-to-end tests |

CI (`.github/workflows/ci.yml`) runs typecheck + lint + unit tests on every push
and PR to `main`. Vercel runs the production build on every push.

---

## Architecture

```
app/
  (site)/        Public pages (home, blog, courses, donate, about, …)
  admin/         Admin portal (gated by ADMIN role)
  api/           Route handlers (auth, newsletter, contact, stripe, cron, admin)
  studio/        Embedded Sanity Studio
components/       Shared React components (PageHeader, Navbar, EmailSignup, …)
lib/             Server/utility code (auth, prisma, env, constants, rate limiting,
                 sanity client/queries, metadata/JSON-LD, analytics)
prisma/          Prisma schema + migrations
sanity/          Sanity schema types
__tests__/       Vitest unit tests
proxy.ts         Edge middleware: security headers (CSP w/ nonce), CSRF origin
                 check, rate limiting, and admin-route protection
```

### Security model

- **Admin access** is derived from the `ADMIN_EMAIL_*` allowlist and re-checked on
  every request from the signed JWT. A non-allowlisted email can never be ADMIN.
- **`proxy.ts`** sets CSP (nonce + `strict-dynamic`), HSTS, X-Frame-Options, etc.,
  enforces a same-origin CSRF check on mutating API requests, and gates `/admin`.
- **Rate limiting** is DB-backed (`lib/rateLimitDb.ts`) so limits survive
  serverless cold starts; login is additionally limited per-account.
- Passwords are bcrypt-hashed (cost 12); reset/verification tokens are random,
  SHA-256 hashed at rest, single-use, and time-boxed.

### Content

Sermons, articles, courses, series, authors, testimonials, and videos are managed
in Sanity Studio at `/studio`. Pages fetch via GROQ (`lib/sanity/queries.ts`) with
ISR (`revalidate = 3600`).

---

## Pre-launch

Outstanding go-live items are tracked in [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md).

---

## Deployment

Hosted on Vercel; every push to `main` triggers a production deploy. Database
schema changes are applied with `npx prisma db push` against the Neon database.
