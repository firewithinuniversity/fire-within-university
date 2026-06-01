/**
 * scripts/seed-courses.ts
 *
 * Seeds 4 course templates into Sanity CMS with placeholder lessons.
 * Each course has 8 lesson slots — fill in real content via the Studio at /studio.
 *
 * Usage:
 *   npx tsx scripts/seed-courses.ts
 *
 * Idempotent — safe to run multiple times (uses createOrReplace).
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

function textBlock(text: string, style: string = "normal") {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
  };
}

// ─── Course Definitions ─────────────────────────────────────────────────────

const courses = [
  {
    id: "course-holy-spirit",
    title: "The Holy Spirit",
    slug: "the-holy-spirit",
    description:
      "An in-depth study of the person and work of the Holy Spirit — who He is, how He moves, and what it means to walk in His power every day.",
    instructor: "Brett & Jude",
    whatYoullLearn: [
      "Understand the Holy Spirit as a person, not just a force",
      "Discover the gifts and fruit of the Spirit",
      "Learn how to be led by the Spirit daily",
      "Study the role of the Spirit in the early church",
      "Understand the baptism and filling of the Holy Spirit",
    ],
    lessons: [
      {
        id: "hs-lesson-1",
        title: "Who Is the Holy Spirit?",
        slug: "who-is-the-holy-spirit",
        num: 1,
        scripture: "John 14:16-17",
        body: "An introduction to the third person of the Trinity — the Helper, Counselor, and Comforter that Jesus promised would come.",
      },
      {
        id: "hs-lesson-2",
        title: "The Spirit in the Old Testament",
        slug: "the-spirit-in-the-old-testament",
        num: 2,
        scripture: "Genesis 1:2; Judges 6:34; Isaiah 61:1",
        body: "Tracing the Holy Spirit's work from creation through the prophets — how He moved before Pentecost.",
      },
      {
        id: "hs-lesson-3",
        title: "Pentecost and the Birth of the Church",
        slug: "pentecost-and-the-birth-of-the-church",
        num: 3,
        scripture: "Acts 2:1-21",
        body: "The day everything changed — when the Spirit was poured out on all believers and the church was born in power.",
      },
      {
        id: "hs-lesson-4",
        title: "The Gifts of the Spirit",
        slug: "the-gifts-of-the-spirit",
        num: 4,
        scripture: "1 Corinthians 12:1-11",
        body: "Understanding the spiritual gifts — what they are, how they operate, and why they are given for the common good.",
      },
      {
        id: "hs-lesson-5",
        title: "The Fruit of the Spirit",
        slug: "the-fruit-of-the-spirit",
        num: 5,
        scripture: "Galatians 5:22-23",
        body: "Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control — the evidence of a Spirit-filled life.",
      },
      {
        id: "hs-lesson-6",
        title: "The Baptism of the Holy Spirit",
        slug: "the-baptism-of-the-holy-spirit",
        num: 6,
        scripture: "Acts 1:4-8",
        body: "What does it mean to be baptized in the Holy Spirit? Examining Scripture and understanding this empowering experience.",
      },
      {
        id: "hs-lesson-7",
        title: "Walking in the Spirit",
        slug: "walking-in-the-spirit",
        num: 7,
        scripture: "Galatians 5:16-25",
        body: "Practical guidance on living a Spirit-led life — how to hear His voice, follow His leading, and resist the flesh.",
      },
      {
        id: "hs-lesson-8",
        title: "The Spirit and the Word",
        slug: "the-spirit-and-the-word",
        num: 8,
        scripture: "2 Timothy 3:16-17; John 16:13",
        body: "How the Holy Spirit works through Scripture to teach, convict, and transform us into the image of Christ.",
      },
    ],
  },
  {
    id: "course-song-of-solomon",
    title: "Song of Solomon",
    slug: "song-of-solomon",
    description:
      "A verse-by-verse journey through the most intimate book of the Bible — exploring divine love, covenant relationship, and what it reveals about God's passion for His people.",
    instructor: "Brett & Jude",
    whatYoullLearn: [
      "Understand the historical and literary context of Song of Solomon",
      "Explore the allegorical and literal interpretations",
      "Discover what this book reveals about God's love for us",
      "Study the themes of desire, pursuit, and covenant faithfulness",
      "Apply its wisdom to relationships and spiritual intimacy",
    ],
    lessons: [
      {
        id: "sos-lesson-1",
        title: "Introduction to Song of Solomon",
        slug: "introduction-to-song-of-solomon",
        num: 1,
        scripture: "Song of Solomon 1:1-4",
        body: "Setting the stage — who wrote it, when, why, and the different ways the church has interpreted this powerful love poem throughout history.",
      },
      {
        id: "sos-lesson-2",
        title: "The Pursuit of Love",
        slug: "the-pursuit-of-love",
        num: 2,
        scripture: "Song of Solomon 1:5 - 2:7",
        body: "The beloved's longing and the lover's pursuit — a picture of how God relentlessly pursues a relationship with us.",
      },
      {
        id: "sos-lesson-3",
        title: "The Voice of My Beloved",
        slug: "the-voice-of-my-beloved",
        num: 3,
        scripture: "Song of Solomon 2:8-17",
        body: "Learning to recognize and respond to the voice of the one who loves us — both in human relationships and in our walk with God.",
      },
      {
        id: "sos-lesson-4",
        title: "Searching in the Night",
        slug: "searching-in-the-night",
        num: 4,
        scripture: "Song of Solomon 3:1-5",
        body: "The dark night of the soul — what happens when we feel distant from God and how to seek Him even in seasons of silence.",
      },
      {
        id: "sos-lesson-5",
        title: "The Beauty of the Beloved",
        slug: "the-beauty-of-the-beloved",
        num: 5,
        scripture: "Song of Solomon 4:1-16",
        body: "How God sees His people — declared beautiful, without flaw, cherished beyond measure. Understanding our identity through His eyes.",
      },
      {
        id: "sos-lesson-6",
        title: "The Garden Enclosed",
        slug: "the-garden-enclosed",
        num: 6,
        scripture: "Song of Solomon 5:1 - 6:3",
        body: "Intimacy, exclusivity, and covenant faithfulness — the sacred nature of being set apart for the one who loves you.",
      },
      {
        id: "sos-lesson-7",
        title: "Love as Strong as Death",
        slug: "love-as-strong-as-death",
        num: 7,
        scripture: "Song of Solomon 8:6-7",
        body: "The climax of the book — love that cannot be quenched by many waters. A love that foreshadows the cross itself.",
      },
      {
        id: "sos-lesson-8",
        title: "Living in Covenant Love",
        slug: "living-in-covenant-love",
        num: 8,
        scripture: "Song of Solomon 8:8-14",
        body: "Bringing it all together — how the Song of Solomon shapes our understanding of marriage, devotion, and our eternal relationship with God.",
      },
    ],
  },
  {
    id: "course-the-trinity",
    title: "The Trinity",
    slug: "the-trinity",
    description:
      "One God, three persons — Father, Son, and Holy Spirit. This course unpacks one of the most essential and mysterious doctrines of the Christian faith.",
    instructor: "Brett & Jude",
    whatYoullLearn: [
      "Define the doctrine of the Trinity from Scripture",
      "Understand how Father, Son, and Spirit relate to each other",
      "Avoid common heresies and misconceptions about the Trinity",
      "See the Trinity at work in creation, redemption, and daily life",
      "Deepen your worship through understanding God's triune nature",
    ],
    lessons: [
      {
        id: "tri-lesson-1",
        title: "One God, Three Persons",
        slug: "one-god-three-persons",
        num: 1,
        scripture: "Matthew 28:19; Deuteronomy 6:4",
        body: "Laying the foundation — what we mean when we say God is one essence in three persons, and why it matters for every believer.",
      },
      {
        id: "tri-lesson-2",
        title: "God the Father",
        slug: "god-the-father",
        num: 2,
        scripture: "Ephesians 1:3-14",
        body: "The Father's role in the Trinity — Creator, Sustainer, the one from whom all blessings flow. Understanding His heart for His children.",
      },
      {
        id: "tri-lesson-3",
        title: "God the Son",
        slug: "god-the-son",
        num: 3,
        scripture: "Colossians 1:15-20; John 1:1-14",
        body: "Jesus Christ — the visible image of the invisible God. How the Son reveals the Father and accomplishes redemption.",
      },
      {
        id: "tri-lesson-4",
        title: "God the Holy Spirit",
        slug: "god-the-holy-spirit",
        num: 4,
        scripture: "John 14:16-17; Romans 8:26-27",
        body: "The Spirit's divine personhood — not an impersonal force, but God Himself dwelling within every believer.",
      },
      {
        id: "tri-lesson-5",
        title: "The Trinity in the Old Testament",
        slug: "the-trinity-in-the-old-testament",
        num: 5,
        scripture: "Genesis 1:26; Isaiah 48:16; Psalm 110:1",
        body: "Tracing hints and glimpses of the triune God throughout the Hebrew Scriptures — the plural 'us' in creation, the Angel of the Lord, and more.",
      },
      {
        id: "tri-lesson-6",
        title: "Common Heresies and Misconceptions",
        slug: "common-heresies-and-misconceptions",
        num: 6,
        scripture: "1 John 5:7-8",
        body: "Modalism, Arianism, tritheism — understanding what the Trinity is NOT, and why these errors matter for sound doctrine.",
      },
      {
        id: "tri-lesson-7",
        title: "The Trinity in Salvation",
        slug: "the-trinity-in-salvation",
        num: 7,
        scripture: "Ephesians 2:18; Titus 3:4-7",
        body: "How all three persons of the Trinity work together in our salvation — the Father plans, the Son accomplishes, the Spirit applies.",
      },
      {
        id: "tri-lesson-8",
        title: "Worshiping the Triune God",
        slug: "worshiping-the-triune-god",
        num: 8,
        scripture: "Revelation 4:8-11",
        body: "Bringing theology into doxology — how understanding the Trinity transforms our prayer life, worship, and daily walk with God.",
      },
    ],
  },
  {
    id: "course-ot-theology",
    title: "Old Testament Theology",
    slug: "old-testament-theology",
    description:
      "A sweeping survey of the major themes and theological threads woven throughout the Old Testament — from creation to exile, and everything pointing to Christ.",
    instructor: "Brett & Jude",
    whatYoullLearn: [
      "Trace the grand narrative of the Old Testament",
      "Understand key covenants: Abrahamic, Mosaic, Davidic, New",
      "See how the Old Testament points to Jesus at every turn",
      "Study the major themes: creation, fall, redemption, restoration",
      "Apply Old Testament wisdom to modern life and faith",
    ],
    lessons: [
      {
        id: "ot-lesson-1",
        title: "Creation and the Character of God",
        slug: "creation-and-the-character-of-god",
        num: 1,
        scripture: "Genesis 1-2",
        body: "In the beginning God created — and everything He made reveals something about who He is. Exploring what creation teaches us about our Creator.",
      },
      {
        id: "ot-lesson-2",
        title: "The Fall and the Promise",
        slug: "the-fall-and-the-promise",
        num: 2,
        scripture: "Genesis 3:1-24",
        body: "Sin enters the world — but even in judgment, God makes a promise. The protoevangelium (first gospel) and the beginning of redemption's story.",
      },
      {
        id: "ot-lesson-3",
        title: "The Abrahamic Covenant",
        slug: "the-abrahamic-covenant",
        num: 3,
        scripture: "Genesis 12:1-3; 15:1-21",
        body: "God calls one man and makes an unconditional promise — a great nation, a great name, and through him all families of the earth will be blessed.",
      },
      {
        id: "ot-lesson-4",
        title: "Exodus and Redemption",
        slug: "exodus-and-redemption",
        num: 4,
        scripture: "Exodus 12:1-14; 14:13-14",
        body: "Israel's deliverance from Egypt — the Passover lamb, the parting of the sea, and the greatest picture of salvation before the cross.",
      },
      {
        id: "ot-lesson-5",
        title: "The Law and the Mosaic Covenant",
        slug: "the-law-and-the-mosaic-covenant",
        num: 5,
        scripture: "Exodus 19-20; Deuteronomy 6:4-9",
        body: "Sinai, the Ten Commandments, and the covenant that defined Israel's relationship with God. Understanding the Law's purpose and its limits.",
      },
      {
        id: "ot-lesson-6",
        title: "The Davidic Kingdom",
        slug: "the-davidic-kingdom",
        num: 6,
        scripture: "2 Samuel 7:12-16; Psalm 2",
        body: "A shepherd becomes king, and God makes an everlasting covenant — a throne that will endure forever, pointing to the ultimate King: Jesus.",
      },
      {
        id: "ot-lesson-7",
        title: "The Prophets and the Exile",
        slug: "the-prophets-and-the-exile",
        num: 7,
        scripture: "Isaiah 53; Jeremiah 29:11; Ezekiel 37",
        body: "Israel's unfaithfulness leads to exile — but God raises up prophets who call the people back and point forward to a coming Messiah and a new covenant.",
      },
      {
        id: "ot-lesson-8",
        title: "Pointing to Christ",
        slug: "pointing-to-christ",
        num: 8,
        scripture: "Luke 24:27; Isaiah 7:14; Micah 5:2",
        body: "The entire Old Testament is a signpost to Jesus. Tracing the scarlet thread of redemption from Genesis to Malachi and seeing how every story whispers His name.",
      },
    ],
  },
];

// ─── Seed execution ─────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding 4 course templates into Sanity...\n");
  console.log(`   Project: ${projectId}`);
  console.log(`   Dataset: ${dataset}\n`);

  for (const course of courses) {
    // Create lessons first
    for (const lesson of course.lessons) {
      const doc = {
        _id: lesson.id,
        _type: "lesson",
        title: lesson.title,
        slug: { _type: "slug", current: lesson.slug },
        lessonNumber: lesson.num,
        scripture: lesson.scripture,
        duration: "Coming soon",
        body: [
          textBlock(lesson.title, "h2"),
          textBlock(lesson.body),
          textBlock(""),
          textBlock("Content coming soon — this is a placeholder lesson. Edit this in the Sanity Studio at /studio.", "blockquote"),
        ],
      };

      try {
        await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0]);
        console.log(`   Lesson ${lesson.num}: ${lesson.title}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`   FAIL ${lesson.title}: ${msg}`);
      }
    }

    // Create course with lesson references
    const courseDoc = {
      _id: course.id,
      _type: "course",
      title: course.title,
      slug: { _type: "slug", current: course.slug },
      description: course.description,
      instructor: course.instructor,
      featured: true,
      publishedAt: new Date().toISOString(),
      whatYoullLearn: course.whatYoullLearn,
      lessons: course.lessons.map((l, i) => ({
        _type: "reference",
        _ref: l.id,
        _key: `k${i}`,
      })),
    };

    try {
      await client.createOrReplace(courseDoc as Parameters<typeof client.createOrReplace>[0]);
      console.log(`\n   COURSE: ${course.title} (${course.lessons.length} lessons)\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   FAIL Course ${course.title}: ${msg}`);
    }
  }

  console.log("\nDone! 4 courses with 32 lessons seeded.");
  console.log("Edit content in the Studio: http://localhost:3000/studio");
  console.log("View courses: http://localhost:3000/courses\n");
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
