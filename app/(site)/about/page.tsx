import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EmailSignup from "@/components/EmailSignup";
import { getAllAuthors } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Fire Within University — our mission, team, and the heart behind this ministry.",
};

export default async function AboutPage() {
  const authors = await getAllAuthors();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Mission section */}
      <section className="text-center mb-20 space-y-6">
        <div className="flex justify-center" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" className="text-gold/40">
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream">
          About Fire Within University
        </h1>
        <p className="text-cream/60 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Fire Within University exists to equip believers with sound biblical
          teaching, practical discipleship resources, and a community that stirs
          one another toward love and good deeds.
        </p>
        <p className="text-cream/40 max-w-2xl mx-auto leading-relaxed">
          We believe the Word of God is living and active — capable of setting
          hearts on fire for Jesus. Our goal is simple: produce content that
          drives people into Scripture and deeper relationship with Christ.
        </p>

        <div className="bg-[#4A2A12]/60 border border-white/[0.06] rounded-2xl px-6 py-5 max-w-lg mx-auto">
          <p className="text-cream/60 text-sm italic leading-relaxed">
            &ldquo;For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit.&rdquo;
          </p>
          <a
            href="https://www.biblegateway.com/passage/?search=Hebrews+4%3A12&version=NIV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold text-xs font-semibold mt-2 inline-block transition-colors"
          >
            — Hebrews 4:12
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: (
              // Open book
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3H10a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H2z" />
                <path d="M22 4.5A1.5 1.5 0 0 0 20.5 3H14a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H22z" />
              </svg>
            ),
            title: "Word-Centered",
            description:
              "Everything we teach is anchored in Scripture. We hold firmly to the authority and sufficiency of God's Word.",
          },
          {
            icon: (
              // Flame
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2c.6 2.4 2 4 3.5 5.5C17.5 9.6 19 11.8 19 14.5A7 7 0 1 1 5 14.5c0-2 .9-3.7 2.2-5 .6.9 1.3 1.6 2.1 2 .1-2.5 1-4.8 2.7-9.5Z" />
                <path d="M12 10c.4 1 1.2 1.8 2 2.6.9.9 1.5 1.8 1.5 3a3.5 3.5 0 1 1-7 0c0-1 .5-1.7 1.1-2.4.4.4.8.7 1.2.9 0-1.1.5-2.2 1.2-4.1Z" opacity=".55" />
              </svg>
            ),
            title: "Spirit-Led",
            description:
              "We believe the Holy Spirit empowers believers for a life of worship, witness, and transformation.",
          },
          {
            icon: (
              // Three connected people
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="6" r="2.25" />
                <circle cx="5.5" cy="9" r="1.75" />
                <circle cx="18.5" cy="9" r="1.75" />
                <path d="M7.5 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
                <path d="M2.5 18.5c0-2 1.3-3.5 3-3.5" />
                <path d="M21.5 18.5c0-2-1.3-3.5-3-3.5" />
              </svg>
            ),
            title: "Community-Focused",
            description:
              "We are not meant to walk alone. We create resources that connect believers and build up the body of Christ.",
          },
        ].map(({ icon, title, description }) => (
          <div
            key={title}
            className="bg-[#4A2A12]/70 border border-white/[0.06] rounded-2xl p-7 hover:shadow-[0_20px_40px_-12px_rgba(61,31,10,0.4)] hover:-translate-y-1 transition-all duration-300 text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/[0.08] text-gold mx-auto">
              {icon}
            </div>
            <h3 className="font-serif text-lg font-bold text-cream">{title}</h3>
            <p className="text-sm text-cream/60 leading-relaxed">{description}</p>
          </div>
        ))}
      </section>

      <section className="mb-20 py-12 px-6 md:px-10 bg-[#4A2A12]/60 border border-white/[0.06] rounded-2xl text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cream mb-3">
          Join the Mission
        </h2>
        <p className="text-cream/60 max-w-md mx-auto mb-6 leading-relaxed">
          Drop your email below to get new sermons and articles delivered to your inbox.
        </p>

        <div className="max-w-md mx-auto">
          <EmailSignup variant="inline" />
        </div>

        <div className="mt-8 pt-6 border-t border-cream/[0.06] flex flex-col sm:flex-row gap-3 justify-center items-center">
          <span className="text-xs text-cream/40 uppercase tracking-widest font-semibold">
            Or
          </span>
          <Link
            href="/donate"
            className="text-gold hover:text-gold font-semibold text-sm transition-colors inline-flex items-center gap-1.5 hover:gap-2"
          >
            Support the Ministry with a Gift <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Team / Authors */}
      {authors.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl font-bold text-cream text-center mb-8">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authors.map((author) => {
              const photoUrl = author.photo
                ? imageUrlFor(author.photo)
                    .width(120)
                    .height(120)
                    .fit("crop")
                    .auto("format")
                    .url()
                : null;

              return (
                <div
                  key={author._id}
                  className="flex gap-5 items-start p-6 bg-[#4A2A12]/70 border border-white/[0.06] rounded-2xl hover:shadow-[0_20px_40px_-12px_rgba(61,31,10,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={author.name}
                      width={80}
                      height={80}
                      className="rounded-full w-20 h-20 object-cover flex-shrink-0 ring-3 ring-gold/30 ring-offset-2 ring-offset-[#1a0f05]"
                    />
                  ) : (
                    <div className="rounded-full w-20 h-20 bg-orange text-cream flex items-center justify-center flex-shrink-0 ring-3 ring-gold/30 ring-offset-2 ring-offset-[#1a0f05]">
                      <span className="text-3xl font-serif font-bold">
                        {author.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <p className="font-serif font-bold text-cream text-lg">
                      {author.name}
                    </p>
                    {author.role && (
                      <p className="text-xs text-gold font-semibold uppercase tracking-widest">
                        {author.role}
                      </p>
                    )}
                    {author.bio && (
                      <p className="text-sm text-cream/60 leading-relaxed">
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
