import Link from "next/link";
import PostCard from "@/components/PostCard";
import EmailSignup from "@/components/EmailSignup";
import ScriptureOfTheDay from "@/components/ScriptureOfTheDay";
import TestimonialsSection from "@/components/TestimonialsSection";
import { getFeaturedPosts } from "@/lib/sanity/queries";

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();

  return (
    <>
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section
        className="relative bg-gradient-to-br from-brown to-brown-light text-cream min-h-[88vh] flex items-center justify-center px-4 py-20 text-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Radial gold glow — adds visual depth */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto space-y-8">
          {/* Eyebrow label */}
          <p className="inline-block text-gold font-semibold text-sm uppercase tracking-[0.2em] border border-gold/40 rounded-full px-4 py-1.5 bg-gold/10">
            Ministry · Teaching · Discipleship
          </p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
            Set Your Heart{" "}
            <span className="text-gold">On Fire</span>
          </h1>

          <p className="text-cream/85 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-light">
            Sermons, articles, and resources to deepen your faith and ignite your walk with Jesus.
          </p>

          <p className="text-cream/75 text-sm italic">
            &ldquo;I have come to bring fire on the earth, and how I wish it were already kindled!&rdquo; —{" "}
            <a
              href="https://www.biblegateway.com/passage/?search=Luke+12%3A49"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gold transition-colors"
            >
              Luke 12:49
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/blog"
              className="bg-orange hover:bg-orange-hover text-cream font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-[0_4px_20px_rgba(196,94,26,0.4)] hover:shadow-[0_8px_30px_rgba(196,94,26,0.5)] hover:-translate-y-0.5 text-base"
            >
              Read Sermons &amp; Articles
            </Link>
            <Link
              href="/donate"
              className="border-2 border-cream/80 hover:border-cream hover:bg-cream/10 text-cream font-semibold px-10 py-4 rounded-full transition-all duration-200 text-base backdrop-blur-sm"
            >
              Support the Ministry
            </Link>
          </div>

          <div className="pt-8 border-t border-cream/15 max-w-md mx-auto">
            <EmailSignup variant="hero" />
          </div>
        </div>
      </section>

      {/* ── Scripture of the Day ──────────────────────────────────────── */}
      <ScriptureOfTheDay />

      {/* ── Featured Posts ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16" aria-label="Featured content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <p className="text-orange font-bold text-xs uppercase tracking-widest mb-1">Fresh Content</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown leading-tight">
              Latest from the Ministry
            </h2>
          </div>
          <Link href="/blog" className="text-orange hover:text-orange-hover text-sm font-semibold transition-colors flex items-center gap-1 hover:gap-2 duration-150 self-start sm:self-auto">
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto text-center py-14 space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto">
              <svg width="22" height="34" viewBox="0 0 24 36" className="text-orange/60" fill="currentColor" aria-hidden="true">
                <rect x="9" y="0" width="6" height="36" rx="3"/>
                <rect x="0" y="10" width="24" height="6" rx="3"/>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-3xl font-bold text-brown">Content Coming Soon</p>
              <p className="text-brown/60 leading-relaxed">
                Be the first to know when we publish. Drop your email below and we will
                notify you the moment the first sermon goes live.
              </p>
            </div>
            <div className="pt-2">
              <EmailSignup variant="inline" />
            </div>
            <p className="text-brown/45 text-sm italic pt-4 border-t border-brown/10">
              &ldquo;He who began a good work in you will carry it on to completion.&rdquo;
              {" "}
              <a
                href="https://www.biblegateway.com/passage/?search=Philippians+1%3A6&version=NIV"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange hover:text-orange-hover not-italic font-semibold text-xs transition-colors"
              >
                — Philippians 1:6
              </a>
            </p>
          </div>
        )}
      </section>

      {/* ── Mission ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-cream to-cream-dark border-t border-brown/[0.06] border-b border-brown/[0.06] py-24 px-4 overflow-hidden">
        {/* Subtle radial warmth — like candlelight in a room */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/[0.06] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          {/* Gold accent line */}
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <div className="w-8 h-px bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-8 h-px bg-gold/40" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown leading-tight">Our Mission</h2>
          <p className="text-brown/75 leading-relaxed text-lg md:text-xl max-w-2xl mx-auto">
            Fire Within University exists to equip believers with sound biblical teaching, practical discipleship resources, and a community that stirs one another toward love and good deeds.
          </p>
          <p className="text-brown/55 leading-relaxed italic max-w-xl mx-auto">
            &ldquo;And let us consider how we may spur one another on toward love and good deeds.&rdquo; — Hebrews 10:24
          </p>
          <Link href="/about" className="inline-flex items-center gap-2 text-orange hover:text-orange-hover font-semibold transition-all hover:gap-3 duration-200">
            Learn more about us <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Transition divider — bridges cream sections into the dark Give CTA ─── */}
      <div
        aria-hidden="true"
        className="bg-gradient-to-b from-cream-dark to-cream pt-16 pb-20 px-4"
      >
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gold/45 to-gold/45" />
          <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" className="text-gold/70 flex-shrink-0">
            <rect x="5" y="0" width="4" height="20" rx="2" />
            <rect x="0" y="6" width="14" height="4" rx="2" />
          </svg>
          <div className="flex-grow h-px bg-gradient-to-l from-transparent via-gold/45 to-gold/45" />
        </div>
      </div>

      {/* ── Give CTA ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brown to-[#2A1506] text-cream pt-28 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/[0.08] rounded-full blur-[80px] -translate-y-1/3" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange/[0.06] rounded-full blur-3xl translate-y-1/2" />
        </div>
        <div className="relative max-w-2xl mx-auto space-y-8">
          {/* Small cross icon above heading */}
          <div className="flex justify-center" aria-hidden="true">
            <svg width="20" height="30" viewBox="0 0 20 30" fill="currentColor" className="text-gold/50">
              <rect x="8" y="0" width="4" height="30" rx="2" />
              <rect x="0" y="9" width="20" height="4" rx="2" />
            </svg>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Sow Into <span className="text-gold">the Kingdom</span>
          </h2>
          <p className="text-cream/80 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
            Every seed sown bears fruit. Your generosity fuels sermons, articles, and resources that reach souls for Christ.
          </p>
          <p className="text-cream/50 text-sm italic max-w-md mx-auto">
            &ldquo;Remember this: Whoever sows generously will also reap generously.&rdquo; — 2 Corinthians 9:6
          </p>
          <Link
            href="/donate"
            className="inline-block bg-gold hover:bg-gold-dark text-brown font-bold px-12 py-4 rounded-full transition-all duration-200 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 text-base"
          >
            Give Today
          </Link>
          <p className="text-xs text-cream/35 mt-2">We are not a 501(c)(3). Donations are not tax-deductible.</p>
        </div>
      </section>
    </>
  );
}
