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
    logo: `${BASE_URL}/pwa-icon-512`,
    description: "Sermons, articles, and resources to fuel your faith. A ministry committed to igniting hearts for Jesus.",
    sameAs: [
      "https://www.youtube.com/@FireWithinUnv",
      "https://www.instagram.com/firewithinunv/",
      "https://www.tiktok.com/@firewithinunv",
      "https://x.com/TheFireWithinUn",
      "https://open.spotify.com/user/315dlj4ma4gvra6jhbsjjkmjrp7y",
    ],
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
  updatedAt?: string;
  authorName: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    datePublished: opts.publishedAt,
    ...(opts.updatedAt ? { dateModified: opts.updatedAt } : {}),
    author: {
      "@type": "Person",
      name: opts.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Fire Within University",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/pwa-icon-512` },
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
  const provider = {
    "@type": "Organization",
    name: "Fire Within University",
    url: BASE_URL,
  };
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    provider,
    // Free, online, self-paced — required/recommended for Google Course rich results
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT1H",
      ...(opts.instructor
        ? { instructor: { "@type": "Person", name: opts.instructor } }
        : {}),
    },
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
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
