/**
 * app/(site)/privacy-policy/page.tsx — Privacy Policy
 *
 * Covers GDPR, CCPA, COPPA, CAN-SPAM, Google Analytics ToS,
 * Mailchimp ToS, and Stripe requirements.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Fire Within University.",
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = "firewithinuniveristy@gmail.com";
const LAST_UPDATED = "April 10, 2026";
const SITE_URL = "firewithinuniversity.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-serif text-4xl font-bold text-cream mb-2">Privacy Policy</h1>
        <p className="text-sm text-cream/35">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Intro */}
      <div className="bg-gold/[0.06] border border-gold/[0.15] rounded-xl px-6 py-5 mb-10">
        <p className="text-sm text-cream/70 leading-relaxed italic">
          &ldquo;The integrity of the upright guides them.&rdquo; — Proverbs 11:3
        </p>
        <p className="text-sm text-cream/60 leading-relaxed mt-3">
          We believe in handling your personal information with honesty and care.
          This policy explains plainly what we collect, why, and how you can
          control it. We will never exploit your data. If you have any questions,
          email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <div className="space-y-10 text-cream/70 leading-relaxed">

        {/* 1 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">1. Who We Are</h2>
          <p>
            Fire Within University (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            is a Christian ministry operating the website at{" "}
            <strong>{SITE_URL}</strong>. We are not a registered 501(c)(3) nonprofit organization.
            You can reach us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">2. What Information We Collect</h2>

          <h3 className="font-semibold text-cream/90 mb-2 mt-4">Information You Give Us</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70">
            <li>
              <strong>Newsletter signup:</strong> Your email address, collected when you subscribe.
              Stored by Mailchimp on our behalf.
            </li>
            <li>
              <strong>Contact form:</strong> Your name, email address, and message. Sent directly
              to our inbox via Resend. Not stored in a database.
            </li>
            <li>
              <strong>Donations:</strong> Your name and email address as entered during Stripe
              checkout, used only to send your donation receipt. We never see or store your card
              number, bank details, or billing address — Stripe handles all of that.
            </li>
          </ul>

          <h3 className="font-semibold text-cream/90 mb-2 mt-6">Information Collected Automatically</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70">
            <li>
              <strong>Analytics:</strong> We use Google Analytics 4 to understand how visitors use
              our site (pages visited, time on site, general location by country, device type).
              This data is anonymous and aggregated. <em>Google Analytics only activates after
              you accept cookies via our consent banner.</em>
            </li>
            <li>
              <strong>Server logs:</strong> Like all websites, our hosting provider (Vercel) may
              log IP addresses and request details for security and performance purposes. We do not
              access or use these logs for marketing.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">3. Cookies</h2>
          <p>
            We use cookies <strong>only for Google Analytics</strong>, and only after you grant
            explicit consent through our cookie banner. We do not use advertising cookies,
            retargeting pixels, or social media tracking cookies.
          </p>
          <p className="mt-3">
            You can withdraw cookie consent at any time by clearing your browser&apos;s cookies
            or clicking &ldquo;Decline&rdquo; in our cookie banner. The site functions fully
            without analytics cookies.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">4. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70">
            <li>To send you ministry newsletters, sermons, and articles you subscribed to</li>
            <li>To respond to your messages, questions, or prayer requests</li>
            <li>To process your donation and send you a receipt</li>
            <li>To understand how visitors use our site so we can improve it</li>
            <li>To fulfill any legal obligations</li>
          </ul>
          <p className="mt-4 font-medium">
            We will never sell, rent, trade, or share your personal information with any
            third party for marketing purposes. Ever.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">5. Third-Party Services</h2>
          <p className="mb-3 text-sm">
            We use the following services to operate the ministry. Each has its own privacy policy:
          </p>
          <ul className="space-y-3 text-sm">
            {[
              {
                name: "Mailchimp (Intuit)",
                purpose: "Email newsletter delivery and list management",
                url: "https://mailchimp.com/legal/privacy/",
              },
              {
                name: "Stripe",
                purpose: "Secure donation payment processing",
                url: "https://stripe.com/privacy",
              },
              {
                name: "Resend",
                purpose: "Transactional emails (contact form delivery)",
                url: "https://resend.com/legal/privacy-policy",
              },
              {
                name: "Google Analytics 4",
                purpose: "Anonymous website usage analytics (consent required)",
                url: "https://policies.google.com/privacy",
              },
              {
                name: "Sanity",
                purpose: "Content management — stores our published sermons and articles",
                url: "https://www.sanity.io/legal/privacy",
              },
              {
                name: "Vercel",
                purpose: "Website hosting and delivery",
                url: "https://vercel.com/legal/privacy-policy",
              },
            ].map(({ name, purpose, url }) => (
              <li key={name} className="flex gap-2">
                <span className="text-gold mt-0.5">✦</span>
                <span>
                  <strong>{name}</strong> — {purpose}.{" "}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-gold underline">
                    Privacy Policy ↗
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">6. Your Rights</h2>
          <p className="mb-3">
            Regardless of where you live, we honor the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Deletion:</strong> Request that we delete your personal data. Use the{" "}
              <a href="/contact" className="text-gold underline">contact form</a> or email us directly.</li>
            <li><strong>Correction:</strong> Request that we correct inaccurate data.</li>
            <li><strong>Unsubscribe:</strong> Opt out of our newsletter at any time via the unsubscribe
              link in every email we send.</li>
            <li><strong>Cookie withdrawal:</strong> Revoke analytics consent by clearing browser cookies.</li>
            <li><strong>No sale of data:</strong> We do not sell your personal information. California
              residents: this satisfies your CCPA right to opt out of the sale of personal information.</li>
          </ul>
          <p className="mt-4 text-sm">
            To exercise any of these rights, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>{" "}
            or use our <a href="/contact" className="text-gold underline">contact form</a>.
            We will respond within 30 days.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">7. Children&apos;s Privacy</h2>
          <p>
            This website is not directed at children under the age of 13. We do not knowingly
            collect personal information from children under 13. If you believe a child under 13
            has submitted personal information to us, please contact us immediately at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>{" "}
            and we will delete it promptly.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">8. Data Security</h2>
          <p>
            We take reasonable technical measures to protect your information, including
            HTTPS encryption on all pages, secure API tokens, and no storage of payment
            card data on our servers. However, no internet transmission is 100% secure.
            We encourage you to use strong passwords and exercise caution online.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">9. Data Retention</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70">
            <li>Newsletter subscribers: retained until you unsubscribe.</li>
            <li>Contact form messages: retained in our email inbox until deleted by us.</li>
            <li>Donation records: retained as required by financial record-keeping practices.</li>
            <li>Analytics data: retained per Google Analytics default settings (up to 14 months).</li>
          </ul>
          <p className="mt-3 text-sm">
            We will delete your data upon a verifiable written request to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy when our practices change or when required by law.
            The &ldquo;Last updated&rdquo; date at the top of this page will reflect any revisions.
            Material changes will be announced via our newsletter. Continued use of the site after
            changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">11. Contact Us</h2>
          <p>
            For any privacy-related questions, data requests, or concerns, please reach us at:
          </p>
          <div className="mt-3 bg-[#4A2A12]/70 border border-white/[0.06] rounded-xl px-5 py-4 text-sm">
            <p className="font-semibold text-cream">Fire Within University</p>
            <p>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              Contact form:{" "}
              <a href="/contact" className="text-gold underline">
                {SITE_URL}/contact
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
