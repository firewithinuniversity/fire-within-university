/**
 * app/(site)/statement-of-faith/page.tsx — Statement of Faith
 *
 * A warm, clear summary of what Fire Within University believes. Every
 * credible ministry site publishes one — it is the theological foundation
 * visitors look for before trusting a ministry with their time and money.
 *
 * Ten doctrinal sections, each with supporting Scripture references that
 * link out to Bible Gateway (NIV).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Statement of Faith",
  description:
    "What we believe at Fire Within University — the core biblical doctrines that anchor everything we teach, write, and proclaim.",
  alternates: { canonical: canonicalUrl("/statement-of-faith") },
  openGraph: {
    title: "Statement of Faith — Fire Within University",
    description:
      "The core biblical doctrines that anchor everything we teach, write, and proclaim at Fire Within University.",
    url: canonicalUrl("/statement-of-faith"),
    type: "article",
  },
};

/* ── helper: Bible Gateway link ─────────────────────────────────────── */
function ScriptureRef({
  reference,
  passage,
}: {
  reference: string;
  passage: string;
}) {
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(passage)}&version=NIV`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold hover:text-gold/80 transition-colors"
    >
      {reference}
    </a>
  );
}

/* ── doctrinal content ──────────────────────────────────────────────── */
const DOCTRINES: {
  number: number;
  title: string;
  body: React.ReactNode;
}[] = [
  {
    number: 1,
    title: "The Holy Scriptures",
    body: (
      <>
        <p>
          We believe the Bible is the inspired, inerrant, and infallible Word of
          God. It was written by human authors under the supernatural guidance of
          the Holy Spirit and is the supreme and final authority in all matters of
          faith and practice. Scripture needs no addition, and no other revelation
          is needed for us to know God and live in a way that pleases him.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="2 Timothy 3:16-17" passage="2 Timothy 3:16-17" />
          {" | "}
          <ScriptureRef reference="2 Peter 1:20-21" passage="2 Peter 1:20-21" />
          {" | "}
          <ScriptureRef reference="Psalm 119:105" passage="Psalm 119:105" />
        </p>
      </>
    ),
  },
  {
    number: 2,
    title: "The Trinity",
    body: (
      <>
        <p>
          We believe in one God who exists eternally in three distinct persons —
          Father, Son, and Holy Spirit — equal in power, glory, and majesty. These
          three persons are one God, not three gods. The Trinity is the foundation
          of Christian faith and the deepest mystery of who God is.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Deuteronomy 6:4" passage="Deuteronomy 6:4" />
          {" | "}
          <ScriptureRef reference="Matthew 28:19" passage="Matthew 28:19" />
          {" | "}
          <ScriptureRef reference="2 Corinthians 13:14" passage="2 Corinthians 13:14" />
        </p>
      </>
    ),
  },
  {
    number: 3,
    title: "God the Father",
    body: (
      <>
        <p>
          We believe God the Father is the Creator and Sustainer of all things.
          He is sovereign over all that exists, infinite in holiness, and perfect
          in love. He is a personal God who hears prayer, forgives sin, and
          graciously involves himself in the affairs of those who seek him. He is
          faithful to every promise he has made.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Genesis 1:1" passage="Genesis 1:1" />
          {" | "}
          <ScriptureRef reference="Ephesians 4:6" passage="Ephesians 4:6" />
          {" | "}
          <ScriptureRef reference="1 John 3:1" passage="1 John 3:1" />
        </p>
      </>
    ),
  },
  {
    number: 4,
    title: "Jesus Christ",
    body: (
      <>
        <p>
          We believe Jesus Christ is the eternal Son of God, fully God and fully
          man. He was conceived by the Holy Spirit, born of the virgin Mary, and
          lived a sinless life. He died on the cross as a substitutionary
          sacrifice for our sins, was buried, and rose bodily from the grave on
          the third day. He ascended to the right hand of the Father, where he
          intercedes for his people, and he will return in glory to judge the
          living and the dead. He is the only way to the Father, and there is no
          salvation apart from him.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="John 1:1,14" passage="John 1:1,14" />
          {" | "}
          <ScriptureRef reference="Philippians 2:5-11" passage="Philippians 2:5-11" />
          {" | "}
          <ScriptureRef reference="Acts 1:9-11" passage="Acts 1:9-11" />
        </p>
      </>
    ),
  },
  {
    number: 5,
    title: "The Holy Spirit",
    body: (
      <>
        <p>
          We believe the Holy Spirit is fully God, the third person of the
          Trinity. He convicts the world of sin, righteousness, and judgment. He
          regenerates, indwells, seals, and empowers every believer at the moment
          of salvation. He illuminates Scripture, produces godly character in us,
          distributes spiritual gifts for the building up of the Church, and
          empowers believers for witness and service.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="John 16:7-13" passage="John 16:7-13" />
          {" | "}
          <ScriptureRef reference="Romans 8:9-11" passage="Romans 8:9-11" />
          {" | "}
          <ScriptureRef reference="Galatians 5:22-25" passage="Galatians 5:22-25" />
        </p>
      </>
    ),
  },
  {
    number: 6,
    title: "Humanity and Sin",
    body: (
      <>
        <p>
          We believe God created human beings — male and female — in his own
          image, with inherent dignity, value, and purpose. Through the
          disobedience of Adam and Eve, sin entered the world and affected all of
          humanity. Every person is born with a sinful nature, separated from God,
          and unable to save themselves. Apart from Christ, we are spiritually dead
          and in desperate need of rescue.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Genesis 1:27" passage="Genesis 1:27" />
          {" | "}
          <ScriptureRef reference="Romans 3:23" passage="Romans 3:23" />
          {" | "}
          <ScriptureRef reference="Ephesians 2:1-3" passage="Ephesians 2:1-3" />
        </p>
      </>
    ),
  },
  {
    number: 7,
    title: "Salvation",
    body: (
      <>
        <p>
          We believe salvation is a free gift of God, given by grace alone,
          through faith alone, in Jesus Christ alone. It cannot be earned by good
          works, religious performance, or human effort. When a person repents of
          their sin and trusts in Christ, they are justified — declared righteous
          before God — forgiven of all sin, and adopted into the family of God.
          Those whom God saves, he keeps; nothing can separate us from his love.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Ephesians 2:8-9" passage="Ephesians 2:8-9" />
          {" | "}
          <ScriptureRef reference="Romans 6:23" passage="Romans 6:23" />
          {" | "}
          <ScriptureRef reference="John 10:28-29" passage="John 10:28-29" />
        </p>
      </>
    ),
  },
  {
    number: 8,
    title: "The Church",
    body: (
      <>
        <p>
          We believe the Church is the body of Christ, made up of all who have
          placed their faith in him — across every nation, language, and
          generation. The local church is the God-ordained gathering where
          believers worship, receive teaching, share communion, practice baptism,
          exercise their gifts, and hold one another accountable in love. Every
          believer is called to be an active, committed member of a local church.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Ephesians 1:22-23" passage="Ephesians 1:22-23" />
          {" | "}
          <ScriptureRef reference="Hebrews 10:24-25" passage="Hebrews 10:24-25" />
          {" | "}
          <ScriptureRef reference="Acts 2:42-47" passage="Acts 2:42-47" />
        </p>
      </>
    ),
  },
  {
    number: 9,
    title: "The Christian Life",
    body: (
      <>
        <p>
          We believe every follower of Jesus is called to a life of ongoing
          sanctification — being transformed by the Holy Spirit into the image of
          Christ. This happens through the reading and study of Scripture, prayer,
          worship, fellowship, service, and obedience. Discipleship is not
          optional; it is the normal Christian life. We are called to deny
          ourselves, take up our cross daily, and follow Jesus with everything
          we have.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Romans 12:1-2" passage="Romans 12:1-2" />
          {" | "}
          <ScriptureRef reference="Luke 9:23" passage="Luke 9:23" />
          {" | "}
          <ScriptureRef reference="2 Peter 3:18" passage="2 Peter 3:18" />
        </p>
      </>
    ),
  },
  {
    number: 10,
    title: "Eternity",
    body: (
      <>
        <p>
          We believe that Jesus Christ will return visibly and bodily to judge
          the living and the dead. Those who have trusted in him will receive
          eternal life in the presence of God — a glorious new creation where
          death, pain, and sin are no more. Those who have rejected Christ will
          face eternal separation from God. Heaven and hell are real. This life
          is not the end; it is the beginning.
        </p>
        <p className="mt-3">
          <ScriptureRef reference="Revelation 21:1-4" passage="Revelation 21:1-4" />
          {" | "}
          <ScriptureRef reference="John 14:2-3" passage="John 14:2-3" />
          {" | "}
          <ScriptureRef reference="Matthew 25:46" passage="Matthew 25:46" />
        </p>
      </>
    ),
  },
];

export default function StatementOfFaithPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section className="text-center mb-16 space-y-6">
        {/* Gold cross icon */}
        <div className="flex justify-center" aria-hidden="true">
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="currentColor"
            className="text-gold/40"
          >
            <rect x="6" y="0" width="4" height="24" rx="2" />
            <rect x="0" y="7" width="16" height="4" rx="2" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream">
          Statement of Faith
        </h1>
        <p className="text-cream/60 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          These are the core biblical truths that anchor everything we teach,
          write, and proclaim at Fire Within University. We hold them not as cold
          doctrine, but as the living convictions that set our hearts on fire.
        </p>

        {/* Scripture banner */}
        <div className="bg-brown-card/60 border border-white/[0.06] rounded-2xl px-6 py-5 max-w-lg mx-auto">
          <p className="text-cream/60 text-sm italic leading-relaxed">
            &ldquo;Stand firm and hold fast to the teachings we passed on to
            you.&rdquo;
          </p>
          <a
            href="https://www.biblegateway.com/passage/?search=2+Thessalonians+2%3A15&version=NIV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold text-xs font-semibold mt-2 inline-block transition-colors"
          >
            — 2 Thessalonians 2:15
          </a>
        </div>
      </section>

      {/* ── Doctrine sections ───────────────────────────────────────── */}
      <div className="space-y-8">
        {DOCTRINES.map(({ number, title, body }) => (
          <section
            key={number}
            className="bg-brown-card/60 border border-white/[0.06] rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-start gap-4">
              {/* Numbered badge */}
              <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-gold/[0.10] text-gold font-bold text-sm">
                {number}
              </span>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-cream mb-3">
                  {title}
                </h2>
                <div className="text-cream/70 leading-relaxed text-[0.95rem]">
                  {body}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── Closing note ────────────────────────────────────────────── */}
      <section className="mt-16 text-center space-y-6">
        <div
          className="flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <div className="w-12 h-px bg-gold/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <div className="w-12 h-px bg-gold/50" />
        </div>

        <p className="text-cream/55 italic max-w-lg mx-auto leading-relaxed">
          We hold these truths in humility, knowing that our understanding is
          partial, but our God is not. We are united not by perfect theology but
          by a perfect Savior.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/ethos"
            className="bg-orange hover:bg-orange-hover text-cream font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(196,94,26,0.3)] hover:-translate-y-0.5 text-sm"
          >
            Read Our Ethos
          </Link>
          <Link
            href="/about"
            className="border border-cream/30 hover:border-cream/60 text-cream font-semibold px-8 py-3.5 rounded-full transition-all duration-200 text-sm"
          >
            About the Ministry
          </Link>
        </div>
      </section>
    </div>
  );
}
