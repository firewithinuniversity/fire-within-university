/**
 * app/(site)/ethos/page.tsx — Our Ethos
 *
 * The prophetic heartbeat of the ministry. This is not a mission statement —
 * it's a personal cry that birthed Fire Within University.
 *
 * DESIGN INTENT:
 * Reverent, spacious, contemplative. The words carry weight — the design
 * should not compete with them. Serif body type, generous line-height,
 * narrow measure, and gold accents only for the prayer at the end.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Ethos",
  description:
    "The prophetic heartbeat of Fire Within University — a cry for the Ancient One, the unreduced Christ, the burning mystery that hell has always feared most.",
  openGraph: {
    title: "Our Ethos — Fire Within University",
    description:
      "A cry for the unreduced Christ. The burning mystery. The One hell has always feared most.",
    type: "article",
  },
};

export default function EthosPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-16 md:py-24 overflow-x-hidden">
      {/* ── Eyebrow & title ─────────────────────────────────────────── */}
      <header className="mb-16 text-center space-y-5">
        <p className="text-gold font-bold text-xs uppercase tracking-[0.3em]">
          Our Ethos
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream leading-[1.15] tracking-tight">
          Give Us Him
        </h1>

        {/* Gold divider with center dot */}
        <div className="flex items-center justify-center gap-3 pt-2" aria-hidden="true">
          <div className="w-12 h-px bg-gold/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <div className="w-12 h-px bg-gold/50" />
        </div>
      </header>

      {/* ── The testimony ───────────────────────────────────────────── */}
      <div className="space-y-8 text-cream/80 font-serif text-[1.125rem] md:text-[1.2rem] leading-[1.85]">
        <p>
          Several years ago something broke open in me. My heart grew hollow
          and restless, hungering for something I couldn&apos;t name but
          couldn&apos;t ignore. It was as if an unseen hand had reached into my
          chest and stirred the deep waters — and I knew, somehow, that what
          was rising wasn&apos;t going away.
        </p>

        <p>
          I couldn&apos;t stomach another polished message from another gifted
          voice. The insights felt thin. The anointing felt borrowed. All I
          wanted was <em className="text-cream">Jesus</em> — not a version of
          him, not a teaching about him. The full weight of who he is. The
          kind of love that wrecks you and won&apos;t let you reassemble
          yourself the same way twice.
        </p>

        <p>
          I had spent years in ministry running hard. Chasing missions. Sitting
          through leadership rooms where the air smelled like ambition dressed
          as vision. I had endured enough cycles of rebranding the church to
          know the pattern — new language, same emptiness. We poured ourselves
          out on methods and models, strategies and systems. Numbers grew.
          People didn&apos;t. They went home still sick, still broke, still
          bound, still deceived, still drowning in despair.
        </p>

        <p>
          And somewhere in the noise I kept hearing Paul&apos;s words like a
          bell in fog — <em>the simplicity that is in Christ</em>. I began to
          wonder if I&apos;d been beguiled the same way Eve was. Slow. Subtle.
          Reasonable sounding. The serpent never announces himself.
        </p>

        {/* Pull quote — the pivot */}
        <blockquote className="border-l-[3px] border-gold pl-7 py-2 my-14 italic text-cream/85 text-[1.18rem] md:text-[1.28rem] leading-relaxed">
          We have traded the burning mystery of who Jesus is for the
          comfortable usefulness of what Jesus does for us. We&apos;ve swapped
          the living creature&apos;s unrelenting gaze for the self-help wisdom
          of men in pulpits telling us how to live better. The glory has
          thinned. The wonder has gone quiet.
        </blockquote>
      </div>

      {/* ── The prayer ──────────────────────────────────────────────── */}
      <section
        aria-label="The prayer"
        className="mt-16 relative"
      >
        {/* Soft gold glow backdrop */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-gold/[0.08] via-brown-card/40 to-transparent rounded-3xl -mx-6 md:-mx-10"
          aria-hidden="true"
        />

        <div className="relative px-2 py-10 md:py-14 space-y-7 text-center">
          <p className="text-gold font-bold text-xs uppercase tracking-[0.3em]">
            A Prayer
          </p>

          <div className="space-y-6 font-serif text-[1.15rem] md:text-[1.3rem] leading-[1.8] text-cream/85">
            <p>
              God, deliver us. Not from difficulty — from <em>smallness</em>.
              Give us back the Ancient One.
            </p>

            <p>
              The One who silenced seas and shattered hell. The One who made
              apostles fall on their faces and sent demons fleeing in terror.
              Give us what the saints across the ages couldn&apos;t get enough
              of and couldn&apos;t fully explain. Give us what hell has always
              feared most.
            </p>
          </div>

          {/* The final line — set apart */}
          <div className="pt-8">
            <p className="font-serif text-4xl md:text-5xl font-bold text-cream tracking-tight leading-tight">
              Give us <span className="text-gold italic">him</span>.
            </p>
          </div>

          {/* Closing accent */}
          <div className="flex items-center justify-center gap-3 pt-6" aria-hidden="true">
            <div className="w-10 h-px bg-gold/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="w-10 h-px bg-gold/50" />
          </div>
        </div>
      </section>

      {/* ── Call to action ──────────────────────────────────────────── */}
      <div className="mt-20 pt-10 border-t border-cream/[0.06] text-center space-y-6">
        <p className="text-cream/55 italic max-w-md mx-auto">
          If this is the hunger in you too — walk with us.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/blog"
            className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(196,94,26,0.3)] hover:-translate-y-0.5 text-sm"
          >
            Read the Sermons
          </Link>
          <Link
            href="/about"
            className="border border-cream/30 hover:border-cream/60 text-cream font-semibold px-8 py-3.5 rounded-full transition-all duration-200 text-sm"
          >
            About the Ministry
          </Link>
        </div>
      </div>
    </article>
  );
}
