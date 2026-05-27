import { getTodaysScripture } from "@/lib/scripture";

export default function ScriptureOfTheDay() {
  const scripture = getTodaysScripture();

  return (
    <section
      aria-label="Scripture of the Day"
      className="bg-gradient-to-r from-brown-card/30 via-gold/[0.06] to-brown-card/30 border-y border-gold/[0.15] py-10 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold mb-5">
          ✦ Scripture of the Day ✦
        </p>

        <blockquote className="relative pl-6 border-l-4 border-gold/60">
          <p className="font-serif text-xl md:text-2xl italic text-cream/80 leading-relaxed">
            &ldquo;{scripture.text}&rdquo;
          </p>

          <footer className="mt-3">
            <a
              href={scripture.bibleGatewayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light font-semibold text-sm transition-colors hover:underline underline-offset-2"
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
