# 🚀 Fire Within University — Pre-Launch Checklist

These are the **external / manual** items to finish before going fully public.
Everything code-related from the two audit rounds is already done and deployed.

## Must do before launch

- [ ] **Mailing address** — Get a P.O. box (USPS, ~$5–15/mo) or use a business
      address. Required by CAN-SPAM for marketing emails.
      - Add it in `app/(site)/privacy-policy/page.tsx` (replace the
        `MAILING_ADDRESS` placeholder)
      - Add it to the newsletter email footer
- [ ] **Email DNS records (SPF / DKIM / DMARC)** at Squarespace, so emails land
      in the inbox instead of spam.
      - Resend → Domains → `firewithinuniversity.com` shows the exact records
      - Add the DKIM CNAMEs + SPF TXT in Squarespace DNS
      - Add a DMARC TXT: host `_dmarc`, value
        `v=DMARC1; p=none; rua=mailto:hello@firewithinuniversity.com`
      - Click **Verify** in Resend
- [ ] **Custom domain** — Connect `firewithinuniversity.com` to Vercel
      (Vercel → Settings → Domains). Update Squarespace DNS to point at Vercel.
- [ ] **Google OAuth redirect URI** — Add the production domain callback in
      Google Cloud Console once the custom domain is live:
      `https://www.firewithinuniversity.com/api/auth/callback/google`
- [ ] **Stripe webhook secret** — Once the bank account is set up, create the
      live webhook endpoint in Stripe and add `STRIPE_WEBHOOK_SECRET` to Vercel.
- [ ] **CRON_SECRET in Vercel** — Confirm it's set (protects /api/cron/*). ✅ done
- [ ] **NEXT_PUBLIC_BASE_URL in Vercel** — Set to the final production URL. ✅ done

## Recommended before accepting real money

- [ ] **Stripe / payments audit** — Run a full end-to-end test of the donation
      flow with live keys (the one audit we deferred).

## Nice to have

- [ ] **Square `logo.png`** in `public/` (currently using the generated icon)
- [ ] **Resend Topics** for granular newsletter unsubscribe (cleaner CAN-SPAM)
- [ ] **External cron** (cron-job.org) only if Neon cold starts become a real
      UX problem — otherwise skip (it can exhaust the Neon free compute budget)
- [ ] Remove the orphaned git worktree `.claude/worktrees/inspiring-golick-a65296`
      when OneDrive isn't locking it (`git worktree remove --force <path>`)

## Already done (for reference)

Two full audit rounds: security, reliability, data integrity, performance,
accessibility, SEO, dependencies, email deliverability, legal/privacy,
responsive/cross-browser, conversion/UX, content, analytics. Newsletter verified
working end-to-end. Legal entity (The Fire Within LLC) in copyright + legal docs.
