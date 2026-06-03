/**
 * scripts/seed-content.ts
 *
 * Seeds template content into Sanity: authors, categories, series,
 * blog posts, testimonials, and sample videos.
 *
 * Usage:
 *   npx tsx scripts/seed-content.ts
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

// ─── Authors ────────────────────────────────────────────────────────────────

const authors = [
  {
    _id: "author-brett",
    _type: "author",
    name: "Brett",
    role: "Co-Founder & Teacher",
    bio: "Brett is passionate about making deep biblical truths accessible and practical. His heart is to see believers equipped and on fire for God.",
    slug: { _type: "slug", current: "brett" },
  },
  {
    _id: "author-jude",
    _type: "author",
    name: "Jude",
    role: "Co-Founder & Teacher",
    bio: "Jude brings a gift for connecting Scripture to everyday life. His teaching style is warm, direct, and grounded in the Word.",
    slug: { _type: "slug", current: "jude" },
  },
  {
    _id: "author-fwu",
    _type: "author",
    name: "Fire Within University",
    role: "Ministry",
    bio: "Fire Within University exists to equip believers with sound biblical teaching, practical discipleship resources, and a community that stirs one another toward love and good deeds.",
    slug: { _type: "slug", current: "fire-within-university" },
  },
];

// ─── Categories ─────────────────────────────────────────────────────────────

const categories = [
  {
    _id: "cat-sermon",
    _type: "category",
    title: "Sermon",
    slug: { _type: "slug", current: "sermon" },
    description: "Messages from our teaching ministry.",
  },
  {
    _id: "cat-article",
    _type: "category",
    title: "Article",
    slug: { _type: "slug", current: "article" },
    description: "Written teachings, reflections, and devotionals.",
  },
  {
    _id: "cat-devotional",
    _type: "category",
    title: "Devotional",
    slug: { _type: "slug", current: "devotional" },
    description: "Short daily encouragements rooted in Scripture.",
  },
  {
    _id: "cat-theology",
    _type: "category",
    title: "Theology",
    slug: { _type: "slug", current: "theology" },
    description: "Deep dives into biblical doctrine and systematic theology.",
  },
];

// ─── Series ─────────────────────────────────────────────────────────────────

const seriesList = [
  {
    _id: "series-fire-and-faith",
    _type: "series",
    title: "Fire & Faith",
    slug: { _type: "slug", current: "fire-and-faith" },
    description: "A multi-part series exploring what it means to live a faith that burns bright — through prayer, trials, and the power of the Holy Spirit.",
  },
  {
    _id: "series-foundations",
    _type: "series",
    title: "Foundations",
    slug: { _type: "slug", current: "foundations" },
    description: "Core biblical truths every believer should know — from salvation to sanctification, Scripture to the Spirit.",
  },
];

// ─── Blog Posts (templates) ─────────────────────────────────────────────────

const posts = [
  {
    _id: "post-power-of-prayer",
    _type: "post",
    title: "The Power of Prayer: Why Your Words Reach Heaven",
    slug: { _type: "slug", current: "the-power-of-prayer" },
    publishedAt: "2026-06-01T08:00:00Z",
    author: { _type: "reference", _ref: "author-brett" },
    category: { _type: "reference", _ref: "cat-sermon" },
    series: { _type: "reference", _ref: "series-fire-and-faith" },
    excerpt: "Prayer is not a ritual — it is a conversation with the living God. Discover why every whispered word reaches the throne room of heaven.",
    body: [
      textBlock("The Power of Prayer", "h2"),
      textBlock("There is nothing more powerful in the life of a believer than prayer. It is not merely a religious exercise or a list of requests — it is an intimate conversation with the Creator of the universe."),
      textBlock("When Jesus taught His disciples to pray in Matthew 6:9-13, He began with relationship: 'Our Father in heaven.' Before any request, before any petition, Jesus established that prayer starts with knowing who you are talking to."),
      textBlock("Why Prayer Changes Us", "h3"),
      textBlock("Prayer does not change God's mind — He already knows what we need before we ask (Matthew 6:8). Prayer changes us. It aligns our hearts with His will. It softens the soil of our souls so that His Word can take root and bear fruit."),
      textBlock("Building a Prayer Life", "h3"),
      textBlock("A consistent prayer life is not built overnight. Start with five honest minutes each morning. Find a quiet place. Begin with thanksgiving — acknowledging who God is and what He has done. Then bring your burdens, your joys, your questions."),
      textBlock("This is a template post — edit or replace this content in the Sanity Studio at /studio.", "blockquote"),
    ],
  },
  {
    _id: "post-faith-over-fear",
    _type: "post",
    title: "Faith Over Fear: Standing Firm When the Storm Comes",
    slug: { _type: "slug", current: "faith-over-fear" },
    publishedAt: "2026-05-25T08:00:00Z",
    author: { _type: "reference", _ref: "author-jude" },
    category: { _type: "reference", _ref: "cat-sermon" },
    series: { _type: "reference", _ref: "series-fire-and-faith" },
    excerpt: "Fear whispers lies in the dark. Faith declares truth in the storm. Learn how to anchor your soul in God's promises when the winds of uncertainty are howling.",
    body: [
      textBlock("Faith Over Fear", "h2"),
      textBlock("In Mark 4:35-41, Jesus and His disciples were caught in a violent storm on the Sea of Galilee. The waves crashed over the boat. The disciples panicked. And Jesus? He was asleep on a cushion in the stern."),
      textBlock("When they woke Him in desperation — 'Teacher, don't you care if we drown?' — Jesus stood up and spoke to the wind and waves: 'Quiet! Be still!' Then He turned to His disciples: 'Why are you so afraid? Do you still have no faith?'"),
      textBlock("The Nature of Fear", "h3"),
      textBlock("Fear is not a sin — it is a human emotion. But fear becomes destructive when we let it drive our decisions instead of faith. Fear says, 'What if?' Faith says, 'Even if.'"),
      textBlock("This is a template post — edit or replace this content in the Sanity Studio at /studio.", "blockquote"),
    ],
  },
  {
    _id: "post-grace-in-trials",
    _type: "post",
    title: "Grace in the Trials: Finding God in Your Hardest Season",
    slug: { _type: "slug", current: "grace-in-trials" },
    publishedAt: "2026-05-18T08:00:00Z",
    author: { _type: "reference", _ref: "author-fwu" },
    category: { _type: "reference", _ref: "cat-article" },
    series: { _type: "reference", _ref: "series-fire-and-faith" },
    excerpt: "Suffering is not a sign of God's absence — it is often the very place where His presence becomes most real.",
    body: [
      textBlock("Grace in the Trials", "h2"),
      textBlock("James 1:2-4 offers one of the most counterintuitive commands in all of Scripture: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.'"),
      textBlock("Joy in trials? It sounds impossible until you understand what James is really saying. He is not asking us to enjoy suffering. He is inviting us to trust the purpose behind it."),
      textBlock("This is a template post — edit or replace this content in the Sanity Studio at /studio.", "blockquote"),
    ],
  },
  {
    _id: "post-who-is-the-holy-spirit",
    _type: "post",
    title: "Who Is the Holy Spirit? A Beginner's Guide",
    slug: { _type: "slug", current: "who-is-the-holy-spirit" },
    publishedAt: "2026-05-10T08:00:00Z",
    author: { _type: "reference", _ref: "author-brett" },
    category: { _type: "reference", _ref: "cat-theology" },
    series: { _type: "reference", _ref: "series-foundations" },
    excerpt: "The Holy Spirit is not a force or a feeling — He is a person. The third member of the Trinity who dwells within every believer.",
    body: [
      textBlock("Who Is the Holy Spirit?", "h2"),
      textBlock("Many Christians struggle to understand the Holy Spirit. We know God the Father. We know Jesus. But the Spirit? He often feels mysterious, abstract, even confusing."),
      textBlock("Yet Scripture is clear: the Holy Spirit is a person — not a force, not an energy, not a vague spiritual presence. He thinks (Romans 8:27), He feels (Ephesians 4:30), He speaks (Acts 13:2), and He can be lied to (Acts 5:3)."),
      textBlock("The Helper Jesus Promised", "h3"),
      textBlock("In John 14:16-17, Jesus told His disciples: 'I will ask the Father, and he will give you another advocate to help you and be with you forever — the Spirit of truth.'"),
      textBlock("This is a template post — edit or replace this content in the Sanity Studio at /studio.", "blockquote"),
    ],
  },
  {
    _id: "post-daily-devotion",
    _type: "post",
    title: "Starting Your Day with God: A Simple Morning Routine",
    slug: { _type: "slug", current: "starting-your-day-with-god" },
    publishedAt: "2026-05-03T08:00:00Z",
    author: { _type: "reference", _ref: "author-jude" },
    category: { _type: "reference", _ref: "cat-devotional" },
    excerpt: "You don't need two hours and a theology degree to meet with God every morning. Just five minutes of honesty can change your entire day.",
    body: [
      textBlock("Starting Your Day with God", "h2"),
      textBlock("The morning sets the tone. Before your phone, before the news, before the noise — there is an invitation to sit with the Creator of the universe."),
      textBlock("You don't need a seminary education or a three-hour block of time. Start with five minutes. Here's a simple framework:"),
      textBlock("1. Thank — What are you grateful for today?", "h3"),
      textBlock("Begin with gratitude. Name one thing. It reorients your heart from anxiety to worship."),
      textBlock("2. Read — One chapter, or even one verse.", "h3"),
      textBlock("Don't race through Scripture. Let one passage sit with you. Ask: what is God saying here?"),
      textBlock("3. Pray — Talk honestly.", "h3"),
      textBlock("No fancy words needed. Tell God what's on your heart. He already knows — He just wants to hear from you."),
      textBlock("This is a template post — edit or replace this content in the Sanity Studio at /studio.", "blockquote"),
    ],
  },
];

// ─── Testimonials ───────────────────────────────────────────────────────────

const testimonials = [
  {
    _id: "testimonial-1",
    _type: "testimonial",
    name: "Sarah M.",
    quote: "Fire Within University has reignited my passion for Scripture. The courses are deep but accessible — exactly what I needed.",
    role: "Student",
  },
  {
    _id: "testimonial-2",
    _type: "testimonial",
    name: "David K.",
    quote: "The sermons here don't just inform — they transform. I've grown more in six months than in the previous six years.",
    role: "Member",
  },
  {
    _id: "testimonial-3",
    _type: "testimonial",
    name: "Maria L.",
    quote: "I love that everything is free and accessible. This ministry is truly doing Kingdom work.",
    role: "Supporter",
  },
];

// ─── Seed execution ─────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding content templates into Sanity...\n");
  console.log(`   Project: ${projectId}`);
  console.log(`   Dataset: ${dataset}\n`);

  const allDocs = [
    ...authors.map((d) => ({ label: `Author: ${d.name}`, doc: d })),
    ...categories.map((d) => ({ label: `Category: ${d.title}`, doc: d })),
    ...seriesList.map((d) => ({ label: `Series: ${d.title}`, doc: d })),
    ...posts.map((d) => ({ label: `Post: ${d.title}`, doc: d })),
    ...testimonials.map((d) => ({ label: `Testimonial: ${d.name}`, doc: d })),
  ];

  for (const { label, doc } of allDocs) {
    try {
      await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0]);
      console.log(`   ✅ ${label}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${label}: ${msg}`);
    }
  }

  console.log(`\nDone! Seeded:`);
  console.log(`   ${authors.length} authors (Brett, Jude, FWU)`);
  console.log(`   ${categories.length} categories (Sermon, Article, Devotional, Theology)`);
  console.log(`   ${seriesList.length} series (Fire & Faith, Foundations)`);
  console.log(`   ${posts.length} blog posts (templates with placeholder content)`);
  console.log(`   ${testimonials.length} testimonials`);
  console.log(`\nEdit content in the Studio: http://localhost:3000/studio`);
  console.log(`View blog: http://localhost:3000/blog\n`);
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
