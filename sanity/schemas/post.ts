/**
 * Post schema — the main content type
 *
 * Represents both sermons AND articles. The "category" field distinguishes them.
 * Using one schema for both keeps the codebase simple — the content team uses
 * one editor for everything, and we render them the same way on the frontend.
 *
 * KEY CONCEPTS:
 * - slug: URL-safe identifier (e.g. "the-power-of-prayer") — must be unique
 * - Portable Text (body): Sanity's rich text format — stored as structured JSON,
 *   not HTML blobs. This lets us add custom renderers (like scripture linking).
 * - reference: a link to another document by its ID. When you add an author to a
 *   post, Sanity stores the author's document ID, not a copy of their data.
 *   This means updating an author profile updates it everywhere automatically.
 */
import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "The URL for this post. e.g. 'the-power-of-prayer' → /blog/the-power-of-prayer",
      options: {
        // Auto-generates a slug from the title; team can override manually
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),

    defineField({
      name: "series",
      title: "Series (optional)",
      type: "reference",
      to: [{ type: "series" }],
      description: "If this post is part of a multi-part series, link it here.",
    }),

    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        // Alt text is required for accessibility and SEO
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description:
            "Describe the image for screen readers and search engines.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "A short 1-3 sentence summary. Shown on blog index cards and in social sharing previews.",
      validation: (rule) => rule.required().max(300),
    }),

    defineField({
      name: "youtubeUrl",
      title: "YouTube Video URL (optional)",
      type: "url",
      description:
        "Paste the full YouTube URL here (e.g. https://www.youtube.com/watch?v=...). If present, the video will appear above the article body.",
    }),

    defineField({
      name: "body",
      title: "Body",
      // Portable Text — Sanity's rich text format.
      // Stored as a JSON array of "blocks" rather than raw HTML.
      // This lets the frontend control exactly how it renders.
      type: "array",
      of: [
        {
          type: "block",
          // Allowed text styles
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            // Standard text decorations
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            // Link annotation — supports both external URLs and internal slugs
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto"],
                      }),
                  },
                  {
                    title: "Open in new tab",
                    name: "blank",
                    type: "boolean",
                  },
                ],
              },
              // Scripture reference annotation — adds inline verse pop-up on hover
              // Usage: highlight "John 3:16" in the editor, click "Scripture Ref",
              // enter the reference. Readers see the verse text on hover.
              {
                title: "Scripture Reference",
                name: "scriptureRef",
                type: "object",
                fields: [
                  defineField({
                    title: "Reference",
                    name: "reference",
                    type: "string",
                    description: 'e.g. "John 3:16" or "Romans 8:28-29"',
                    validation: (rule) => rule.required(),
                  }),
                ],
              },
            ],
          },
        },
        // Inline images within the body (separate from mainImage)
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption (optional)",
              type: "string",
            }),
          ],
        },
      ],
    }),

    defineField({
      name: "pdfFile",
      title: "Downloadable PDF (optional)",
      type: "file",
      description:
        "Upload a PDF for readers to download. If present, a 'Download PDF' button appears at the top of the post.",
      options: { accept: "application/pdf" },
    }),

    defineField({
      name: "affiliateProducts",
      title: "Recommended Resources (optional)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "affiliateProduct" }] }],
      description:
        "Products shown in the 'Resources we recommend' section at the bottom of this post.",
    }),
  ],

  // Controls how posts appear in the Studio list view
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      date: "publishedAt",
    },
    prepare({ title, author, media, date }) {
      const dateStr = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "No date";
      return {
        title,
        subtitle: `${author ?? "No author"} · ${dateStr}`,
        media,
      };
    },
  },
});
