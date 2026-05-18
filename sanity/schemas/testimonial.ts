/**
 * sanity/schemas/testimonial.ts — Testimonial document type
 *
 * Stores quotes from community members, readers, or people touched by the ministry.
 * These appear in the "Fruit of the Ministry" section on the homepage.
 *
 * FIELDS:
 * - name: who said it (required)
 * - location: where they're from or their role (optional — adds authenticity)
 * - quote: what they said (required, max 300 chars so cards stay compact)
 * - photo: optional headshot (creates a personal connection)
 * - featured: toggle to control which ones show on the homepage
 * - order: manual ordering so you can highlight the most impactful quotes first
 */
import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: () => "✝️",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location or Role",
      type: "string",
      description: 'e.g. "Houston, TX" or "Ministry Leader" or "Student"',
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      description: "Keep it concise — 1–3 sentences of genuine impact.",
      validation: (Rule) =>
        Rule.required().min(20).max(300).error("Quote must be 20–300 characters."),
    }),
    defineField({
      name: "photo",
      title: "Photo (optional)",
      type: "image",
      options: { hotspot: true },
      description: "A headshot adds personal connection. Leave blank to show initials instead.",
    }),
    defineField({
      name: "featured",
      title: "Show on Homepage",
      type: "boolean",
      description: "Toggle on to include this testimonial in the homepage section.",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first. Use 1, 2, 3… to control order.",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "quote",
      media: "photo",
    },
  },
});
