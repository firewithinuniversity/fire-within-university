/**
 * lib/metadata.ts — SEO helpers: canonical URLs, JSON-LD structured data
 *
 * Centralises metadata logic so every page is consistent and Google-friendly.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

/** Resolve a path to a full canonical URL */
export function canonicalUrl(path: string = "/"): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** JSON-LD: Organization (used in root layout) */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fire Within University",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
    sameAs: [] as string[], // Add social URLs when ready
  };
}

/** JSON-LD: WebSite with SearchAction (enables Google sitelinks search box) */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fire Within University",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** JSON-LD: Article (for blog posts) */
export function articleJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  authorName: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.publishedAt,
    author: {
      "@type": "Person",
      name: opts.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Fire Within University",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
  };
}

/** JSON-LD: Course */
export function courseJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  instructor?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    provider: {
      "@type": "Organization",
      name: "Fire Within University",
      url: BASE_URL,
    },
    ...(opts.instructor
      ? { instructor: { "@type": "Person", name: opts.instructor } }
      : {}),
  };
}

/** JSON-LD: BreadcrumbList */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** JSON-LD: ItemList (for teaching series — ordered list of posts) */
export function seriesJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
