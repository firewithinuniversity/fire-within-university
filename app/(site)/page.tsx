import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import EmailSignup from "@/components/EmailSignup";
import SectionReveal from "@/components/SectionReveal";
import PostCard from "@/components/PostCard";
import HeroBackground from "@/components/HeroBackground";
import { getAllCourses, getFeaturedPosts, getLatestVideos, type CourseSummary } from "@/lib/sanity/queries";
import VideoCard from "@/components/VideoCard";
import { imageUrlFor } from "@/lib/sanity/image";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Fire Within University — Igniting Hearts for Jesus",
  description: "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
  alternates: {
    canonical: canonicalUrl("/"),
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Fire Within University RSS Feed" }],
    },
  },
  openGraph: {
    title: "Fire Within University — Igniting Hearts for Jesus",
    description: "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
    url: canonicalUrl("/"),
  },
};

export const revalidate = 3600;

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
  { title: "Sermons & Articles", description: "Weekly teachings to strengthen your faith and sharpen your walk.", href: "/blog", icon: "book" },
  { title: "Courses", description: "Structured Bible study with video lessons and downloadable resources.", href: "/courses", icon: "academic" },
  { title: "Teaching Series", description: "Multi-part deep dives into scripture, theology, and the life of faith.", href: "/series", icon: "collection" },
  { title: "Resources", description: "Curated tools and materials for your daily walk with God.", href: "/resources", icon: "tool" },
];

const PLACEHOLDER_COURSES: CourseSummary[] = [
  { _id: "p1", title: "Knowing Jesus", slug: { current: "knowing-jesus" }, description: "A foundational course exploring who Jesus is through Scripture.", instructor: "Fire Within Team", lessonCount: 8, featured: true },
  { _id: "p2", title: "Foundations of Faith", slug: { current: "foundations-of-faith" }, description: "Build a strong biblical foundation covering core doctrines.", instructor: "Fire Within Team", lessonCount: 6, featured: false },
];

function PathwayIcon({ type }: { type: string }) {
  const cls = "w-8 h-8 text-gold";
  switch (type) {
    case "book":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
    case "academic":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
    case "collection":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.013.67-1.871 1.592-2.155" /></svg>;
    case "tool":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" /></svg>;
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
  }
}

export default async function HomePage() {
  const [sanityCourses, latestPosts, latestVideos] = await Promise.all([
    getAllCourses(),
    getFeaturedPosts(),
    getLatestVideos(),
  ]);
  const allCourses = sanityCourses.length > 0 ? sanityCourses : PLACEHOLDER_COURSES;
  const displayCourses = allCourses.slice(0, 4);
  const todayIndex = new Date().getDate() % SCRIPTURES.length;
  const scripture = SCRIPTURES[todayIndex];

  return (
    <div className="bg-brown-deep">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] min-h-[100svh] flex items-center overflow-hidden" aria-label="Hero">
        <HeroBackground />
        {/* Cinematic multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brown-deep/95 via-brown-deep/70 to-brown-deep/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-deep via-transparent to-brown-deep/40" />
        <div className="absolute inset-0 bg-brown-deep/10" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full flex items-center justify-center">
          <div className="max-w-2xl space-y-8 text-center">
            <p className="inline-block text-gold/90 font-semibold text-[11px] uppercase tracking-[0.25em] border border-gold/30 rounded-full px-5 py-2 bg-gold/[0.06] backdrop-blur-sm">
              Ministry · Teaching · Discipleship
            </p>
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.92] text-cream tracking-[-0.02em]">
              Set Your Heart{" "}
              <span className="text-gold">On Fire</span>
            </h1>
            <p className="text-cream/70 text-lg md:text-xl leading-[1.7] font-light max-w-lg mx-auto">
              Sermons, articles, and resources to deepen your faith and ignite your walk with Jesus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                href="/blog"
                className="group bg-orange hover:bg-orange-hover text-cream font-semibold px-10 py-4 rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(196,94,26,0.35)] hover:shadow-[0_8px_32px_rgba(196,94,26,0.5)] hover:-translate-y-0.5 text-[15px] text-center"
              >
                Read Sermons &amp; Articles
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/courses"
                className="group border border-cream/30 hover:border-cream/60 hover:bg-cream/[0.06] text-cream font-semibold px-10 py-4 rounded-full transition-all duration-300 text-[15px] backdrop-blur-sm text-center"
              >
                Explore Courses
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-cream/60 text-[10px] uppercase tracking-[0.3em] font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cream/40 to-transparent" />
        </div>
      </section>

      {/* ── Scripture of the Day ──────────────────────────────────── */}
      <SectionReveal distance={32}>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 relative z-10 mb-24">
          <div className="bg-brown-card/80 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="text-gold/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Scripture of the Day</p>
            <blockquote className="font-serif text-xl md:text-[1.65rem] text-cream/90 leading-[1.6] italic max-w-xl mx-auto">
              &ldquo;{scripture.text}&rdquo;
            </blockquote>
            <a
              href={scripture.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 text-gold/60 hover:text-gold text-sm font-medium transition-colors duration-300"
            >
              — {scripture.ref}
            </a>
          </div>
        </section>
      </SectionReveal>

      {/* ── Latest Videos ──────────────────────────────────────── */}
      {latestVideos.length > 0 && (
        <SectionReveal>
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28" aria-label="Latest videos">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">New Videos</p>
                <h2 className="font-serif text-3xl md:text-[2.5rem] font-bold text-cream leading-tight tracking-[-0.01em]">
                  Latest Videos
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestVideos.map((video, i) => (
                <SectionReveal key={video._id} delay={i * 100} distance={20}>
                  <VideoCard
                    title={video.title}
                    youtubeUrl={video.youtubeUrl}
                    thumbnailUrl={
                      video.thumbnail
                        ? imageUrlFor(video.thumbnail).width(640).height(360).auto("format").quality(75).url()
                        : undefined
                    }
                    category={video.category}
                    speaker={video.speaker}
                    scripture={video.scripture}
                    duration={video.duration}
                  />
                </SectionReveal>
              ))}
            </div>
          </section>
        </SectionReveal>
      )}

      {/* ── Featured Courses ─────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28" aria-label="Featured courses">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Learn &amp; Grow</p>
              <h2 className="font-serif text-3xl md:text-[2.5rem] font-bold text-cream leading-tight tracking-[-0.01em]">
                Featured Courses
              </h2>
            </div>
            <Link href="/courses" className="group text-gold/80 hover:text-gold text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 self-start sm:self-auto">
              View all
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayCourses.map((course, i) => (
              <SectionReveal key={course._id} delay={i * 100} distance={20}>
                <Link
                  href={`/courses/${course.slug.current}`}
                  className="group block bg-brown-card/70 border border-white/[0.06] rounded-2xl overflow-hidden transition-[border-color,box-shadow,transform] duration-300 hover:border-gold/15 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] bg-brown overflow-hidden">
                    {course.coverImage ? (
                      <Image
                        src={imageUrlFor(course.coverImage).width(400).height(250).auto("format").quality(75).url()}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gold/15 transition-colors duration-500 group-hover:text-gold/25" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brown/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-[17px] font-bold text-cream group-hover:text-gold transition-colors duration-300 mb-1.5 leading-snug">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-cream/50 text-[13px] line-clamp-2 mb-3 leading-relaxed">{course.description}</p>
                    )}
                    <span className="text-[11px] text-cream/50 uppercase tracking-wider font-medium">{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ── Latest Sermons ──────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <SectionReveal>
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28" aria-label="Latest sermons">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Fresh From the Fire</p>
                <h2 className="font-serif text-3xl md:text-[2.5rem] font-bold text-cream leading-tight tracking-[-0.01em]">
                  Latest Sermons
                </h2>
              </div>
              <Link href="/blog" className="group text-gold/80 hover:text-gold text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 self-start sm:self-auto">
                View all
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, i) => (
                <SectionReveal key={post._id} delay={i * 100} distance={20}>
                  <PostCard post={post} />
                </SectionReveal>
              ))}
            </div>
          </section>
        </SectionReveal>
      )}

      {/* ── Content Pathways ─────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brown-card/10 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionReveal>
            <div className="text-center mb-16">
              <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em] mb-3">Find Your Way In</p>
              <h2 className="font-serif text-3xl md:text-[2.75rem] font-bold text-cream leading-tight tracking-[-0.02em]">
                Where Would You Like to Start?
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PATHWAYS.map((p, i) => (
              <SectionReveal key={p.href} delay={i * 80} distance={20}>
                <Link
                  href={p.href}
                  className="group relative flex flex-col h-full bg-brown-card/50 border border-white/[0.06] rounded-2xl p-6 transition-[border-color,background-color,transform,box-shadow] duration-300 hover:bg-brown-card/80 hover:border-gold/20 hover:-translate-y-1 hover:shadow-[0_10px_40px_-12px_rgba(232,160,32,0.18)]"
                >
                  <div className="mb-5 p-3 rounded-xl bg-gold/[0.06] w-fit transition-all duration-300 group-hover:bg-gold/[0.12] group-hover:scale-105 group-hover:shadow-[0_0_20px_-4px_rgba(232,160,32,0.3)]">
                    <PathwayIcon type={p.icon} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-cream group-hover:text-gold transition-colors duration-300 mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-cream/50 text-[13px] leading-relaxed mb-4 flex-grow">{p.description}</p>
                  <span className="text-gold/80 text-xs font-semibold uppercase tracking-wider transition-all duration-300 group-hover:text-gold flex items-center gap-1">
                    Explore
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why We Exist ─────────────────────────────────────────── */}
      <SectionReveal distance={32}>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-brown-card/60 border border-white/[0.06] rounded-2xl p-8 md:p-14 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em]">Why We Exist</p>
            <h2 className="font-serif text-3xl md:text-[2.5rem] font-bold text-cream leading-[1.15] tracking-[-0.01em]">Our Mission</h2>
            <p className="text-cream/60 text-lg leading-[1.8] max-w-xl mx-auto">
              Fire Within University exists to equip believers with sound biblical teaching, practical discipleship resources, and a community that stirs one another toward love and good deeds.
            </p>
            <p className="text-cream/50 italic text-sm leading-relaxed">
              &ldquo;And let us consider how we may spur one another on toward love and good deeds.&rdquo; — Hebrews 10:24
            </p>
            <Link href="/about" className="group inline-flex items-center gap-2 text-gold/80 hover:text-gold font-semibold transition-all duration-300 text-sm">
              Learn more about us
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </SectionReveal>

      {/* ── The Prayer ────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brown-deep via-[#2a1508] to-brown-deep" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,160,32,0.4) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <SectionReveal distance={40} duration={1000}>
          <div className="relative max-w-2xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-4" aria-hidden="true">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse-glow" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <p className="text-gold/70 text-[10px] font-bold uppercase tracking-[0.3em]">A Prayer for You</p>
            <p className="font-serif text-2xl md:text-[1.85rem] text-cream/85 leading-[1.65] italic">
              &ldquo;Lord, set our hearts ablaze with a holy fire that cannot be quenched. Let every word we read, every sermon we hear, and every prayer we whisper draw us deeper into Your presence. Amen.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4" aria-hidden="true">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse-glow" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ── Give CTA ──────────────────────────────────────────────── */}
      <SectionReveal distance={32}>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-28">
          <div className="bg-gradient-to-br from-brown-card/80 to-brown/60 border border-white/[0.06] rounded-2xl p-8 md:p-14 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <svg width="18" height="28" viewBox="0 0 18 28" fill="currentColor" className="text-gold/40 mx-auto" aria-hidden="true">
              <rect x="7" y="0" width="4" height="28" rx="2" />
              <rect x="0" y="8" width="18" height="4" rx="2" />
            </svg>
            <h2 className="font-serif text-3xl md:text-[2.5rem] font-bold text-cream leading-tight tracking-[-0.01em]">
              Sow Into <span className="text-gold">the Kingdom</span>
            </h2>
            <p className="text-cream/55 text-lg leading-[1.8] max-w-lg mx-auto">
              Every seed sown bears fruit. Your generosity fuels sermons, articles, and resources that reach souls for Christ.
            </p>
            <p className="text-cream/50 text-sm italic leading-relaxed">
              &ldquo;Remember this: Whoever sows generously will also reap generously.&rdquo; — 2 Corinthians 9:6
            </p>
            <Link
              href="/donate"
              className="group inline-block bg-gold hover:bg-gold-dark text-brown font-bold px-14 py-4 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 text-[15px]"
            >
              Give Today
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </Link>
            <p className="text-[11px] text-cream/50 tracking-wide">We are not a 501(c)(3). Donations are not tax-deductible.</p>
          </div>
        </section>
      </SectionReveal>

      {/* ── Email Signup ──────────────────────────────────────────── */}
      <SectionReveal>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-28">
          <div className="bg-brown-card/50 border border-white/[0.06] rounded-2xl p-8 md:p-12 text-center space-y-5">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-cream tracking-[-0.01em]">Stay Connected</h2>
            <p className="text-cream/50 text-sm max-w-md mx-auto leading-relaxed">
              Get new sermons, articles, and course updates delivered to your inbox.
            </p>
            <div className="pt-3">
              <EmailSignup variant="hero" showIntro={false} location="homepage" />
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
