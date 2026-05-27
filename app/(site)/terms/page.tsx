/**
 * app/(site)/terms/page.tsx — Terms of Service
 *
 * Covers Stripe requirements, FTC affiliate disclosure requirements,
 * DMCA, CAN-SPAM, limitation of liability, and governing law.
 */
import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Fire Within University.",
  robots: { index: true, follow: true },
  alternates: { canonical: canonicalUrl("/terms") },
  openGraph: {
    title: "Terms of Service — Fire Within University",
    description: "Terms of Service for Fire Within University.",
    url: canonicalUrl("/terms"),
  },
};

const CONTACT_EMAIL = "firewithinuniversity@gmail.com";
const LAST_UPDATED = "April 10, 2026";
const SITE_URL = "firewithinuniversity.com";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-serif text-4xl font-bold text-cream mb-2">Terms of Service</h1>
        <p className="text-sm text-cream/50">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Intro */}
      <div className="bg-gold/[0.06] border border-gold/[0.15] rounded-xl px-6 py-5 mb-10">
        <p className="text-sm text-cream/70 leading-relaxed italic">
          &ldquo;Let your yes be yes and your no be no.&rdquo; — Matthew 5:37
        </p>
        <p className="text-sm text-cream/60 leading-relaxed mt-3">
          These terms govern your use of the Fire Within University website. Please read them.
          By using this site you agree to them. Questions? Email us at{" "}
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
            is a Christian ministry operating at <strong>{SITE_URL}</strong>. We are not a
            registered 501(c)(3) nonprofit organization. These Terms of Service constitute a
            legally binding agreement between you and Fire Within University.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">2. Acceptance of Terms</h2>
          <p>
            By accessing or using this website, subscribing to our newsletter, submitting a
            contact form, or making a donation, you confirm that you have read, understood, and
            agree to these Terms of Service and our{" "}
            <a href="/privacy-policy" className="text-gold underline">Privacy Policy</a>.
            If you do not agree, please do not use this site.
          </p>
          <p className="mt-3">
            We reserve the right to modify these terms at any time. The &ldquo;Last updated&rdquo;
            date above reflects the most recent revision. Continued use of the site after changes
            are posted constitutes your acceptance of the updated terms.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">3. Content and Intellectual Property</h2>
          <p>
            All sermons, articles, devotionals, and other content published on this site are the
            intellectual property of Fire Within University, unless otherwise attributed.
          </p>
          <p className="mt-3">
            <strong>You may:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-cream/70 mt-2">
            <li>Share links to our content on social media or personal blogs</li>
            <li>Quote brief excerpts (under 200 words) for personal study, commentary, or educational
              purposes, with clear attribution to Fire Within University and a link to the original</li>
            <li>Print individual articles for personal, non-commercial use</li>
          </ul>
          <p className="mt-3">
            <strong>You may not:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-cream/70 mt-2">
            <li>Republish, sell, or commercially distribute our content without written permission</li>
            <li>Claim our content as your own</li>
            <li>Use our content in any way that misrepresents the ministry or our beliefs</li>
            <li>Scrape or systematically download our content using automated tools</li>
          </ul>
          <p className="mt-3 text-sm">
            To request permission for other uses, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">4. Donations</h2>
          <p>
            Donations made through this website are voluntary financial gifts to support the
            mission and operations of Fire Within University.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-cream/70 mt-3">
            <li>
              <strong>Not tax-deductible:</strong> Fire Within University is not a registered
              501(c)(3) tax-exempt organization. Donations are not tax-deductible under U.S.
              federal or state law.
            </li>
            <li>
              <strong>Non-refundable:</strong> All donations are final and non-refundable
              unless an error occurred during processing. If you believe a charge was made in
              error, contact us within 30 days at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
                {CONTACT_EMAIL}
              </a>
              .
            </li>
            <li>
              <strong>Payment processing:</strong> Donations are processed securely by Stripe.
              By donating, you also agree to{" "}
              <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-gold underline">
                Stripe&apos;s Terms of Service ↗
              </a>
              .
            </li>
            <li>
              <strong>Use of funds:</strong> Donations support the general ministry activities
              of Fire Within University, including website operation, content creation, and
              outreach. We are not obligated to use donations for any specific purpose unless
              explicitly stated in a designated giving campaign.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">5. Affiliate Links & FTC Disclosure</h2>
          <p>
            Some pages and posts on this site contain affiliate links to third-party products
            and services. <strong>If you click an affiliate link and make a purchase, we may
            receive a small commission at no additional cost to you.</strong>
          </p>
          <p className="mt-3">
            We only recommend resources, books, and tools that we genuinely believe will benefit
            your faith and walk with God. Our editorial decisions are never influenced by affiliate
            relationships. This disclosure is made in compliance with the U.S. Federal Trade
            Commission&apos;s guidelines on endorsements and testimonials (16 CFR Part 255).
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">6. Email Communications (CAN-SPAM)</h2>
          <p>
            By subscribing to our newsletter, you consent to receive email communications from
            Fire Within University. Every email we send will include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-cream/70 mt-2">
            <li>Our identity as the sender</li>
            <li>A clear unsubscribe link</li>
            <li>No deceptive subject lines or misleading headers</li>
          </ul>
          <p className="mt-3">
            You may unsubscribe at any time by clicking the unsubscribe link in any email.
            We honor all unsubscribe requests promptly in compliance with the CAN-SPAM Act.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">7. Disclaimer — Not Professional Advice</h2>
          <p>
            The content published on this site — including sermons, articles, devotionals, and
            resource recommendations — is provided for <strong>spiritual encouragement,
            biblical education, and general informational purposes only.</strong>
          </p>
          <p className="mt-3">
            Nothing on this site constitutes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-cream/70 mt-2">
            <li>Professional pastoral counseling or licensed mental health services</li>
            <li>Legal advice</li>
            <li>Financial or investment advice</li>
            <li>Medical advice</li>
          </ul>
          <p className="mt-3">
            If you are facing a crisis or need professional help, please contact a qualified
            counselor, pastor, or emergency services. The National Crisis Lifeline is available
            24/7 at <strong>988</strong>.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Fire Within University and its
            operators shall not be liable for any indirect, incidental, special, or consequential
            damages arising from your use of this website or reliance on its content. Our total
            liability for any claim related to this site shall not exceed the amount you donated
            to us in the 12 months preceding the claim, or $10, whichever is greater.
          </p>
          <p className="mt-3">
            This site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, either express or implied, including but not limited to
            warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">9. External Links</h2>
          <p>
            This site contains links to external websites, including Bible Gateway, affiliate
            products, and third-party ministry resources. We are not responsible for the content,
            accuracy, or privacy practices of any external site. Linking to a site does not
            constitute endorsement of all its content or views.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">10. Prohibited Conduct</h2>
          <p>When using this site, you agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-cream/70 mt-2">
            <li>Submit false, misleading, or fraudulent information via any form</li>
            <li>Attempt to gain unauthorized access to any part of the site or its systems</li>
            <li>Use automated tools to scrape, crawl, or stress-test the site</li>
            <li>Submit spam or unsolicited commercial messages via our contact form</li>
            <li>Impersonate Fire Within University or its representatives</li>
            <li>Use the site for any unlawful purpose</li>
          </ul>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">11. DMCA — Copyright Claims</h2>
          <p>
            If you believe content on this site infringes your copyright, please notify us in
            writing at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>{" "}
            with: (1) identification of the copyrighted work; (2) identification of the infringing
            material and its location on our site; (3) your contact information; (4) a statement
            of good faith belief; and (5) a statement of accuracy under penalty of perjury. We
            will respond promptly to valid DMCA notices.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">12. Governing Law</h2>
          <p>
            These Terms of Service are governed by the laws of the United States. Any disputes
            arising from your use of this site shall be resolved through good-faith negotiation.
            If negotiation fails, disputes shall be subject to binding arbitration under the
            American Arbitration Association&apos;s rules, except that either party may seek
            injunctive relief in a court of competent jurisdiction.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-cream mb-3">13. Contact</h2>
          <p>
            Questions about these terms? We&apos;re here to help.
          </p>
          <div className="mt-3 bg-brown-card/70 border border-white/[0.06] rounded-xl px-5 py-4 text-sm">
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
