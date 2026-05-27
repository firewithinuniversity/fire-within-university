/**
 * scripts/seed-sanity-content.ts
 *
 * Seeds test content into Sanity CMS for local development.
 * Creates: 1 author, 2 categories, 1 series, 3 blog posts, 1 course with 4 lessons.
 *
 * Usage:
 *   npx tsx scripts/seed-sanity-content.ts
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID set in .env.local
 *   - NEXT_PUBLIC_SANITY_DATASET set in .env.local
 *   - SANITY_API_WRITE_TOKEN set in .env.local (needs editor+ permissions)
 *
 * This script is idempotent — running it again will overwrite existing documents
 * with the same IDs (uses createOrReplace).
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("❌ Missing environment variables:");
  if (!projectId) console.error("   - NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!token) console.error("   - SANITY_API_WRITE_TOKEN");
  console.error("\nMake sure .env.local has valid Sanity credentials.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

// ─── Document IDs (stable so script is idempotent) ───────────────────────────

const IDS = {
  author: "seed-author-001",
  categorySermon: "seed-category-sermon",
  categoryArticle: "seed-category-article",
  series: "seed-series-walking-in-faith",
  post1: "seed-post-power-of-prayer",
  post2: "seed-post-faith-over-fear",
  post3: "seed-post-grace-in-trials",
  course: "seed-course-knowing-jesus",
  lesson1: "seed-lesson-who-is-jesus",
  lesson2: "seed-lesson-names-of-jesus",
  lesson3: "seed-lesson-teachings-of-jesus",
  lesson4: "seed-lesson-following-jesus",
};

// ─── Helper: Portable Text block ─────────────────────────────────────────────

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

// ─── Documents ───────────────────────────────────────────────────────────────

const author = {
  _id: IDS.author,
  _type: "author",
  name: "Pastor James Wilson",
  role: "Lead Pastor",
  bio: "Pastor James has been teaching God's Word for over 15 years. His passion is making deep theological truths accessible to everyday believers, helping people move from head knowledge to heart transformation.",
  slug: { _type: "slug", current: "james-wilson" },
};

const categorySermon = {
  _id: IDS.categorySermon,
  _type: "category",
  title: "Sermon",
  slug: { _type: "slug", current: "sermon" },
  description: "Messages from Sunday worship and midweek gatherings.",
};

const categoryArticle = {
  _id: IDS.categoryArticle,
  _type: "category",
  title: "Article",
  slug: { _type: "slug", current: "article" },
  description: "Written teachings, devotionals, and reflections.",
};

const series = {
  _id: IDS.series,
  _type: "series",
  title: "Walking in Faith",
  slug: { _type: "slug", current: "walking-in-faith" },
  description:
    "A three-part series exploring what it means to truly walk by faith in every area of life — from prayer, to overcoming fear, to finding grace in the hardest seasons.",
};

const post1 = {
  _id: IDS.post1,
  _type: "post",
  title: "The Power of Prayer: Why Your Words Reach Heaven",
  slug: { _type: "slug", current: "the-power-of-prayer" },
  publishedAt: "2025-05-10T08:00:00Z",
  author: { _type: "reference", _ref: IDS.author },
  category: { _type: "reference", _ref: IDS.categorySermon },
  series: { _type: "reference", _ref: IDS.series },
  excerpt:
    "Prayer is not a ritual — it is a conversation with the living God. Discover why every whispered word reaches the throne room of heaven and how to build a prayer life that transforms you from the inside out.",
  body: [
    textBlock("The Power of Prayer", "h2"),
    textBlock(
      "There is nothing more powerful in the life of a believer than prayer. It is not merely a religious exercise or a list of requests — it is an intimate conversation with the Creator of the universe."
    ),
    textBlock(
      "When Jesus taught His disciples to pray in Matthew 6:9-13, He began with relationship: 'Our Father in heaven.' Before any request, before any petition, Jesus established that prayer starts with knowing who you are talking to."
    ),
    textBlock("Why Prayer Changes Us", "h3"),
    textBlock(
      "Prayer does not change God's mind — He already knows what we need before we ask (Matthew 6:8). Prayer changes us. It aligns our hearts with His will. It softens the soil of our souls so that His Word can take root and bear fruit."
    ),
    textBlock(
      "Consider this: every great move of God in Scripture was preceded by prayer. The early church in Acts 2 was devoted to prayer. Daniel prayed three times daily even under threat of death. Hannah's desperate prayer in the temple brought forth Samuel, who would anoint kings."
    ),
    textBlock("Building a Prayer Life", "h3"),
    textBlock(
      "A consistent prayer life is not built overnight. Start with five honest minutes each morning. Find a quiet place. Begin with thanksgiving — acknowledging who God is and what He has done. Then bring your burdens, your joys, your questions."
    ),
    textBlock(
      "As Charles Spurgeon wrote: 'Prayer is the slender nerve that moves the muscle of omnipotence.' Your words reach heaven. Your prayers matter. Start today."
    ),
    textBlock("Application", "h2"),
    textBlock(
      "This week, commit to five minutes of uninterrupted prayer each morning. Write down one thing you are thankful for and one thing you are trusting God with. Watch how your perspective shifts by Friday."
    ),
  ],
};

const post2 = {
  _id: IDS.post2,
  _type: "post",
  title: "Faith Over Fear: Standing Firm When the Storm Comes",
  slug: { _type: "slug", current: "faith-over-fear" },
  publishedAt: "2025-05-17T08:00:00Z",
  author: { _type: "reference", _ref: IDS.author },
  category: { _type: "reference", _ref: IDS.categorySermon },
  series: { _type: "reference", _ref: IDS.series },
  excerpt:
    "Fear whispers lies in the dark. Faith declares truth in the storm. Learn how to anchor your soul in God's promises when the winds of uncertainty are howling around you.",
  body: [
    textBlock("Faith Over Fear", "h2"),
    textBlock(
      "In Mark 4:35-41, Jesus and His disciples were caught in a violent storm on the Sea of Galilee. The waves crashed over the boat. The disciples panicked. And Jesus? He was asleep on a cushion in the stern."
    ),
    textBlock(
      "When they woke Him in desperation — 'Teacher, don't you care if we drown?' — Jesus stood up and spoke to the wind and waves: 'Quiet! Be still!' Then He turned to His disciples with a question that echoes through the ages: 'Why are you so afraid? Do you still have no faith?'"
    ),
    textBlock("The Nature of Fear", "h3"),
    textBlock(
      "Fear is not a sin — it is a human emotion. Even Jesus experienced anguish in the Garden of Gethsemane. But fear becomes destructive when we let it drive our decisions instead of faith. Fear says, 'What if?' Faith says, 'Even if.'"
    ),
    textBlock("Choosing Faith in the Storm", "h3"),
    textBlock(
      "Choosing faith does not mean ignoring reality. It means interpreting reality through the lens of God's character. Is God good? Is He sovereign? Has He promised to never leave you? Then whatever storm you face, you face it with Him."
    ),
    textBlock(
      "Isaiah 41:10 says it plainly: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.'"
    ),
    textBlock(
      "The storm may rage, but the One who calms the sea is in your boat. Choose faith today."
    ),
  ],
};

const post3 = {
  _id: IDS.post3,
  _type: "post",
  title: "Grace in the Trials: Finding God in Your Hardest Season",
  slug: { _type: "slug", current: "grace-in-trials" },
  publishedAt: "2025-05-24T08:00:00Z",
  author: { _type: "reference", _ref: IDS.author },
  category: { _type: "reference", _ref: IDS.categoryArticle },
  series: { _type: "reference", _ref: IDS.series },
  excerpt:
    "Suffering is not a sign of God's absence — it is often the very place where His presence becomes most real. This article explores how trials refine our faith and reveal grace we never knew we needed.",
  body: [
    textBlock("Grace in the Trials", "h2"),
    textBlock(
      "James 1:2-4 offers one of the most counterintuitive commands in all of Scripture: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.'"
    ),
    textBlock(
      "Joy in trials? It sounds impossible until you understand what James is really saying. He is not asking us to enjoy suffering. He is inviting us to trust the purpose behind it."
    ),
    textBlock("The Refiner's Fire", "h3"),
    textBlock(
      "A goldsmith heats gold to extreme temperatures not to destroy it, but to purify it. The impurities rise to the surface and are removed. What remains is pure, strong, beautiful. God does the same with our character through trials."
    ),
    textBlock("Finding God in the Valley", "h3"),
    textBlock(
      "David wrote Psalm 23 from experience. 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.' Notice: he did not say God removes us from the valley. He said God is with us in it."
    ),
    textBlock(
      "If you are in a hard season right now — know this: God has not abandoned you. His grace is sufficient. His strength is made perfect in your weakness (2 Corinthians 12:9). Hold on. Morning is coming."
    ),
  ],
};

// ─── Lessons ─────────────────────────────────────────────────────────────────

const lesson1 = {
  _id: IDS.lesson1,
  _type: "lesson",
  title: "Who Is Jesus?",
  slug: { _type: "slug", current: "who-is-jesus" },
  lessonNumber: 1,
  scripture: "John 1:1-14",
  duration: "25 min",
  body: [
    textBlock("Who Is Jesus?", "h2"),
    textBlock(
      "Before we can follow Jesus, we must understand who He is. In John 1:1, we read: 'In the beginning was the Word, and the Word was with God, and the Word was God.' Jesus is not merely a prophet, teacher, or good man — He is God in the flesh."
    ),
    textBlock("The Word Made Flesh", "h3"),
    textBlock(
      "John 1:14 tells us 'The Word became flesh and made his dwelling among us.' The eternal God chose to enter human history. He took on skin and bones, hunger and thirst, joy and tears. This is the mystery of the incarnation."
    ),
    textBlock("Why It Matters", "h3"),
    textBlock(
      "If Jesus is merely a good teacher, we can admire Him from a distance. But if He is God — then everything He said demands a response. His claims are either the words of a lunatic, a liar, or the Lord of all creation."
    ),
  ],
};

const lesson2 = {
  _id: IDS.lesson2,
  _type: "lesson",
  title: "The Names of Jesus",
  slug: { _type: "slug", current: "the-names-of-jesus" },
  lessonNumber: 2,
  scripture: "Isaiah 9:6",
  duration: "20 min",
  body: [
    textBlock("The Names of Jesus", "h2"),
    textBlock(
      "Isaiah 9:6 gives us four names for the coming Messiah: Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace. Each name reveals a different facet of who Jesus is and what He does for us."
    ),
    textBlock("Wonderful Counselor", "h3"),
    textBlock(
      "In a world full of conflicting advice, Jesus offers perfect wisdom. He knows the end from the beginning. His counsel never fails."
    ),
    textBlock("Prince of Peace", "h3"),
    textBlock(
      "The peace Jesus gives is not the absence of conflict — it is the presence of God in the midst of conflict. It is a deep, unshakable calm that comes from knowing who holds your future."
    ),
  ],
};

const lesson3 = {
  _id: IDS.lesson3,
  _type: "lesson",
  title: "The Teachings of Jesus",
  slug: { _type: "slug", current: "the-teachings-of-jesus" },
  lessonNumber: 3,
  scripture: "Matthew 5-7",
  duration: "30 min",
  body: [
    textBlock("The Teachings of Jesus", "h2"),
    textBlock(
      "The Sermon on the Mount (Matthew 5-7) is the most concentrated collection of Jesus' teaching. It covers everything from anger to prayer, worry to generosity. It paints a picture of life in the Kingdom of God."
    ),
    textBlock("The Beatitudes", "h3"),
    textBlock(
      "Jesus begins with the Beatitudes — 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' These statements flip the world's values upside down. In God's kingdom, the humble are exalted, the mourning are comforted, and the peacemakers are called sons of God."
    ),
    textBlock("Salt and Light", "h3"),
    textBlock(
      "Jesus calls His followers 'the salt of the earth' and 'the light of the world.' We are not meant to hide our faith — we are meant to influence the world around us with the flavor of grace and the brightness of truth."
    ),
  ],
};

const lesson4 = {
  _id: IDS.lesson4,
  _type: "lesson",
  title: "Following Jesus Daily",
  slug: { _type: "slug", current: "following-jesus-daily" },
  lessonNumber: 4,
  scripture: "Luke 9:23-25",
  duration: "22 min",
  body: [
    textBlock("Following Jesus Daily", "h2"),
    textBlock(
      "In Luke 9:23, Jesus says: 'Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me.' Following Jesus is not a one-time decision — it is a daily choice, a daily surrender."
    ),
    textBlock("Daily Surrender", "h3"),
    textBlock(
      "Taking up your cross means letting go of your agenda and embracing God's. It means choosing obedience when disobedience is easier. It means trusting God's timing when your own timeline feels better."
    ),
    textBlock("Practical Steps", "h3"),
    textBlock(
      "Start each day with Scripture. Pray before decisions. Serve someone without expecting anything back. Share your faith when the Spirit prompts. These daily habits form the backbone of a life that follows Jesus."
    ),
  ],
};

const courseDoc = {
  _id: IDS.course,
  _type: "course",
  title: "Knowing Jesus",
  slug: { _type: "slug", current: "knowing-jesus" },
  description:
    "A foundational course exploring who Jesus is through Scripture. From His divine nature to His daily teachings, discover the person at the center of the Christian faith.",
  instructor: "Pastor James Wilson",
  featured: true,
  publishedAt: "2025-04-01T08:00:00Z",
  whatYoullLearn: [
    "Understand the deity of Jesus from John 1",
    "Explore the prophetic names of the Messiah",
    "Study the Sermon on the Mount in depth",
    "Build daily habits of following Jesus",
  ],
  lessons: [
    { _type: "reference", _ref: IDS.lesson1, _key: "l1" },
    { _type: "reference", _ref: IDS.lesson2, _key: "l2" },
    { _type: "reference", _ref: IDS.lesson3, _key: "l3" },
    { _type: "reference", _ref: IDS.lesson4, _key: "l4" },
  ],
};

// ─── Seed execution ──────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding Sanity content...\n");
  console.log(`   Project: ${projectId}`);
  console.log(`   Dataset: ${dataset}\n`);

  const documents = [
    { label: "Author (Pastor James Wilson)", doc: author },
    { label: "Category (Sermon)", doc: categorySermon },
    { label: "Category (Article)", doc: categoryArticle },
    { label: "Series (Walking in Faith)", doc: series },
    { label: "Post (The Power of Prayer)", doc: post1 },
    { label: "Post (Faith Over Fear)", doc: post2 },
    { label: "Post (Grace in Trials)", doc: post3 },
    { label: "Lesson 1 (Who Is Jesus?)", doc: lesson1 },
    { label: "Lesson 2 (The Names of Jesus)", doc: lesson2 },
    { label: "Lesson 3 (The Teachings of Jesus)", doc: lesson3 },
    { label: "Lesson 4 (Following Jesus Daily)", doc: lesson4 },
    { label: "Course (Knowing Jesus)", doc: courseDoc },
  ];

  for (const { label, doc } of documents) {
    try {
      await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0]);
      console.log(`   ✅ ${label}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${label}: ${msg}`);
    }
  }

  console.log("\n🎉 Done! Content is now available at:");
  console.log("   Blog:    http://localhost:3000/blog");
  console.log("   Courses: http://localhost:3000/courses");
  console.log("   Series:  http://localhost:3000/series/walking-in-faith");
  console.log("   Search:  Try searching 'Jesus' or 'prayer'");
  console.log("\n   Note: Images are not seeded (Sanity requires asset upload).");
  console.log("   Add cover images via the Studio at /studio if desired.\n");
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
