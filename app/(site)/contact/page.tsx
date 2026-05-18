/**
 * app/(site)/contact/page.tsx — Contact & Prayer Request page
 *
 * The form itself is a Client Component (ContactForm) because it manages
 * state and handles form submission. The page shell is a Server Component.
 */
import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & Prayer Requests",
  description:
    "Reach out to Fire Within University — for prayer requests, general questions, or just to say hello.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12 space-y-5">
        {/* Cross accent */}
        <div className="flex justify-center" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" className="text-gold/40">
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown">
          We&apos;re Here for You
        </h1>
        <p className="text-brown/65 max-w-lg mx-auto leading-relaxed text-lg">
          Whether it&apos;s a prayer request, a question about the faith, or just a
          word of encouragement — your message matters to us.
        </p>
        <p className="text-brown/45 text-sm italic max-w-md mx-auto">
          &ldquo;Carry each other&apos;s burdens, and in this way you will fulfill
          the law of Christ.&rdquo; — Galatians 6:2
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
