/**
 * components/ScriptureOfTheDay.tsx — Daily rotating scripture banner
 *
 * Server Component — no interactivity needed. The scripture is determined
 * at render time using the day of the year, so it's the same for every
 * visitor all day and changes naturally at midnight.
 *
 * DESIGN:
 * A narrow, elegant band between the hero and the featured posts section.
 * Gold accent on the left, serif italic verse text, orange reference link.
 * The "Scripture of the Day" label is subtle — the verse itself is the focus.
 *
 * WHY SERVER COMPONENT:
 * getTodaysScripture() reads the current date — fine to run on the server.
 * No useState, no useEffect, no browser APIs needed. Zero client JS added.
 */
import { getTodaysScripture } from "@/lib/scripture";

export default function ScriptureOfTheDay() {
  const scripture = getTodaysScripture();

  return (
    <section
      aria-label="Scripture of the Day"
      className="bg-gradient-to-r from-[#4A2A12]/30 via-gold/[0.06] to-[#4A2A12]/30 border-y border-gold/[0.15] py-10 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Label */}
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold mb-5">
          ✦ Scripture of the Day ✦
        </p>

        {/* Verse — gold left border, serif italic */}
        <blockquote className="relative pl-6 border-l-4 border-gold/60">
          <p className="font-serif text-xl md:text-2xl italic text-cream/80 leading-relaxed">
            &ldquo;{scripture.text}&rdquo;
          </p>

          {/* Reference — links to BibleGateway */}
          <footer className="mt-3">
            <a
              href={scripture.bibleGatewayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold font-semibold text-sm transition-colors hover:underline underline-offset-2"
              aria-label={`Read ${scripture.reference} on BibleGateway`}
            >
              — {scripture.reference}
            </a>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
