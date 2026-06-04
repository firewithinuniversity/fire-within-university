# Contributing

Thanks for working on Fire Within University. This guide keeps changes safe and
consistent.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in real values
npx prisma generate
npm run dev
```

See the [README](./README.md) for the full env-var reference and architecture.

## Workflow

1. **Branch** off `main` — never commit directly to `main`.
   - `feature/<short-name>`, `fix/<short-name>`, or `chore/<short-name>`
2. Make your change. Keep PRs focused — one concern per PR.
3. **Run the checks locally before pushing** (these are the same checks CI runs):
   ```bash
   npx tsc --noEmit     # typecheck
   npm run lint         # eslint
   npm run test         # unit tests (vitest)
   ```
4. Open a PR against `main`. CI must pass before merge.

## Conventions

- **TypeScript everywhere.** No `any` — the lint config forbids it. Add or
  update types instead.
- **Secrets** live only in `.env.local` / Vercel. Never commit real credentials.
  Add new variables to `.env.example` (with a placeholder) and document them.
- **Server vs client.** Default to Server Components. Add `"use client"` only
  when you need state, effects, or browser APIs.
- **Tests.** Add unit tests for new pure logic (`lib/*`) and for security-
  sensitive behavior (auth, rate limiting, validation). Tests live in
  `__tests__/` and run on Node via Vitest.
- **Security.** Anything touching auth, payments, admin, or user data needs a
  second look. The admin allowlist (`lib/adminEmails.ts`) and middleware
  (`proxy.ts`) are the security boundaries — change them carefully.
- **Database.** Edit `prisma/schema.prisma`, then `npx prisma db push` to sync
  Neon and regenerate the client. Stop the dev server first (it locks the
  Prisma engine on Windows).
- **Content** (sermons, courses, etc.) is managed in Sanity Studio at `/studio`,
  not in code.

## Commit messages

Short imperative subject, optional body explaining *why*. Example:

```
Fix admin lockout: re-derive admin role from email allowlist each request

The 4-hour timeout downgraded sessions created before the feature shipped...
```

## Deploying

Merging to `main` triggers a Vercel production deploy automatically. Database
schema changes must be applied manually with `npx prisma db push`.
