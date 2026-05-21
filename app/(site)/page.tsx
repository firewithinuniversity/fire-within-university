import Link from "next/link";
import Image from "next/image";
import EmailSignup from "@/components/EmailSignup";
import SectionReveal from "@/components/SectionReveal";
import { getAllCourses, type CourseSummary } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

const SCRIPTURES = [
  { text: "I have come to bring fire on the earth, and how I wish it were already kindled!", ref: "Luke 12:49", url: "https://www.biblegateway.com/passage/?search=Luke+12%3A49" },
  { text: "He makes his messengers winds, his servants flames of fire.", ref: "Psalm 104:4", url: "https://www.biblegateway.com/passage/?search=Psalm+104%3A4" },
  { text: "For our God is a consuming fire.", ref: "Hebrews 12:29", url: "https://www.biblegateway.com/passage/?search=Hebrews+12%3A29" },
  { text: "Did not our hearts burn within us while he talked to us on the road?", ref: "Luke 24:32", url: "https://www.biblegateway.com/passage/?search=Luke+24%3A32" },
  { text: "His word is in my heart like a fire, a fire shut up in my bones.", ref: "Jeremiah 20:9", url: "https://www.biblegateway.com/passage/?search=Jeremiah+20%3A9" },
  { text: "The fire on the altar must be kept burning; it must not go out.", ref: "Leviticus 6:12", url: "https://www.biblegateway.com/passage/?search=Leviticus+6%3A12" },
  { text: "When the day of Pentecost came, they saw what seemed to be tongues of fire that separated and came to rest on each of them.", ref: "Acts 2:1-3", url: "https://www.biblegateway.com/passage/?search=Acts+2%3A1-3" },
  { text: "Is not my word like fire, declares the Lord, and like a hammer that breaks a rock in pieces?", ref: "Jeremiah 23:29", url: "https://www.biblegateway.com/passage/?search=Jeremiah+23%3A29" },
  { text: "Fan into flame the gift of God, which is in you.", ref: "2 Timothy 1:6", url: "https://www.biblegateway.com/passage/?search=2+Timothy+1%3A6" },
  { text: "He will baptize you with the Holy Spirit and fire.", ref: "Matthew 3:11", url: "https://www.biblegateway.com/passage/?search=Matthew+3%3A11" },
];

const PATHWAYS = [
  { title: "Sermons & Articles", description: "Weekly teachings to strengthen your faith", href: "/blog", icon: "book" },
  { title: "Courses", description: "Structured Bible study with video lessons", href: "/courses", icon: "academic" },
  { title: "Teaching Series", description: "Multi-part studies on focused topics", href: "/series", icon: "collection" },
  { title: "Resources", description: "Tools and materials for your walk", href: "/resources", icon: "tool" },
];

const PLACEHOLDER_COURSES: CourseSummary[] = [
  { _id: "p1", title: "Knowing Jesus", slug: { current: "knowing-jesus" }, description: "A foundational course exploring who Jesus is through Scripture.", instructor: "Fire Within Team", lessonCount: 8, featured: true },
  { _id: "p2", title: "Foundations of Faith", slug: { current: "foundations-of-faith" }, description: "Build a strong biblical foundation covering core doctrines.", instructor: "Fire Within Team", lessonCount: 6, featured: false },
];

function PathwayIcon({ type }: { type: string }) {
  const cls = "w-[34px] h-[34px] text-gold";
  switch (type) {
    case "book":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
    case "academic":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
    case "collection":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.013.67-1.871 1.592-2.155" /></svg>;
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.024a1.125 1.125 0 01-1.633-1.186l1.028-5.993a1.125 1.125 0 00-.323-.99L.613 5.693a1.125 1.125 0 01.623-1.918l6.018-.874a1.125 1.125 0 00.848-.616L10.613.282a1.125 1.125 0 012.024 0l2.512 5.003a1.125 1.125 0 00.848.616l6.018.874a1.125 1.125 0 01.623 1.918l-4.352 4.232a1.125 1.125 0 00-.323.99l1.028 5.993a1.125 1.125 0 01-1.633 1.186l-5.384-3.024a1.125 1.125 0 00-1.049 0z" /></svg>;
  }
}

export default async function HomePage() {
  const sanityCourses = await getAllCourses();
  const allCourses = sanityCourses.length > 0 ? sanityCourses : PLACEHOLDER_COURSES;
  const displayCourses = allCourses.slice(0, 4);
  const todayIndex = new Date().getDate() % SCRIPTURES.length;
  const scripture = SCRIPTURES[todayIndex];

  return (
    <div className="bg-[#1a0f05]">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" aria-label="Hero">
        {/* Background video (desktop) / image (mobile) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          poster="/hero-door.png"
        >
          <source src="/hero-door.mp4" type="video/mp4" />
        </video>
        <Image
          src="/hero-door.png"
          alt=""
          fill
          className="md:hidden object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f05]/90 via-[#1a0f05]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f05] via-transparent to-[#1a0f05]/30" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            <p className="inline-block text-gold font-semibold text-sm uppercase tracking-[0.2em] border border-gold/40 rounded-full px-4 py-1.5 bg-gold/10">
              Ministry · Teaching · Discipleship
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] text-cream tracking-tight">
              Set Your Heart{" "}
              <span className="text-gold">On Fire</span>
            </h1>
            <p className="text-cream/80 text-xl md:text-2xl leading-relaxed font-light max-w-lg">
              Sermons, articles, and resources to deepen your faith and ignite your walk with Jesus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/blog"
                className="bg-orange hover:bg-orange-hover text-cream font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-[0_4px_20px_rgba(196,94,26,0.4)] hover:shadow-[0_8px_30px_rgba(196,94,26,0.5)] hover:-translate-y-0.5 text-base text-center"
              >
                Read Sermons &amp; Articles
              </Link>
              <Link
                href="/courses"
                className="border-2 border-cream/60 hover:border-cream hover:bg-cream/10 text-cream font-semibold px-10 py-4 rounded-full transition-all duration-200 text-base backdrop-blur-sm text-center"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scripture of the Day ──────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 mb-16">
          <div className="bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-8 md:p-10 text-center">
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Scripture of the Day</p>
            <blockquote className="font-serif text-xl md:text-2xl text-cream/90 leading-relaxed italic max-w-2xl mx-auto">
              &ldquo;{scripture.text}&rdquo;
            </blockquote>
            <a
              href={scripture.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-gold/70 hover:text-gold text-sm font-medium transition-colors"
            >
              — {scripture.ref}
            </a>
          </div>
        </section>
      </SectionReveal>

      {/* ── Featured Courses ─────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-20" aria-label="Featured courses">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
            <div>
              <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">Learn & Grow</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream leading-tight">
                Featured Courses
              </h2>
            </div>
            <Link href="/courses" className="text-gold hover:text-gold-light text-sm font-semibold transition-colors flex items-center gap-1 hover:gap-2 duration-150 self-start sm:self-auto">
              View all <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCourses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course.slug.current}`}
                className="group bg-[#4A2A12] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_28px_-4px_rgba(61,31,10,0.3)] hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] bg-[#3D1F0A]">
                  {course.coverImage ? (
                    <Image
                      src={imageUrlFor(course.coverImage).width(400).height(250).url()}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gold/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-cream group-hover:text-gold transition-colors mb-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-cream/50 text-sm line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <span className="text-xs text-cream/40">{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ── Content Pathways ─────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream text-center mb-12">
            Where Would You Like to Start?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PATHWAYS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-6 text-center transition-all duration-300 hover:border-gold/20 hover:-translate-y-1"
              >
                <div className="flex justify-center mb-4">
                  <PathwayIcon type={p.icon} />
                </div>
                <h3 className="font-serif text-lg font-bold text-cream group-hover:text-gold transition-colors mb-2">
                  {p.title}
                </h3>
                <p className="text-cream/50 text-sm">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ── Why We Exist ─────────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center space-y-6">
            <div className="flex items-center justify-center gap-3" aria-hidden="true">
              <div className="w-8 h-px bg-gold/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              <div className="w-8 h-px bg-gold/40" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream">Our Mission</h2>
            <p className="text-cream/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Fire Within University exists to equip believers with sound biblical teaching, practical discipleship resources, and a community that stirs one another toward love and good deeds.
            </p>
            <p className="text-cream/50 italic text-sm">
              &ldquo;And let us consider how we may spur one another on toward love and good deeds.&rdquo; — Hebrews 10:24
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold transition-all hover:gap-3 duration-200 text-sm">
              Learn more about us <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </SectionReveal>

      {/* ── The Prayer ────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A2A12]/40 via-[#1a0f05] to-[#1a0f05]" />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <p className="text-gold text-xs font-bold uppercase tracking-widest">A Prayer for You</p>
          <p className="font-serif text-2xl md:text-3xl text-cream/90 leading-relaxed italic">
            &ldquo;Lord, set our hearts ablaze with a holy fire that cannot be quenched. Let every word we read, every sermon we hear, and every prayer we whisper draw us deeper into Your presence. Amen.&rdquo;
          </p>
        </div>
      </section>

      {/* ── Give CTA ──────────────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center space-y-6">
            <svg width="20" height="30" viewBox="0 0 20 30" fill="currentColor" className="text-gold/50 mx-auto" aria-hidden="true">
              <rect x="8" y="0" width="4" height="30" rx="2" />
              <rect x="0" y="9" width="20" height="4" rx="2" />
            </svg>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream">
              Sow Into <span className="text-gold">the Kingdom</span>
            </h2>
            <p className="text-cream/70 text-lg leading-relaxed max-w-xl mx-auto">
              Every seed sown bears fruit. Your generosity fuels sermons, articles, and resources that reach souls for Christ.
            </p>
            <p className="text-cream/50 text-sm italic">
              &ldquo;Remember this: Whoever sows generously will also reap generously.&rdquo; — 2 Corinthians 9:6
            </p>
            <Link
              href="/donate"
              className="inline-block bg-gold hover:bg-gold-dark text-brown font-bold px-12 py-4 rounded-full transition-all duration-200 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 text-base"
            >
              Give Today
            </Link>
            <p className="text-xs text-cream/35">We are not a 501(c)(3). Donations are not tax-deductible.</p>
          </div>
        </section>
      </SectionReveal>

      {/* ── Email Signup ──────────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 pb-24">
          <div className="bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-8 md:p-10 text-center space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-cream">Stay Connected</h2>
            <p className="text-cream/60 text-sm max-w-md mx-auto">
              Get new sermons, articles, and course updates delivered to your inbox.
            </p>
            <div className="pt-2">
              <EmailSignup variant="hero" />
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
