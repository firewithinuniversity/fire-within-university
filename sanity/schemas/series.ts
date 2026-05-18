/**
 * Series schema
 *
 * Groups related sermons/articles together — e.g. a 4-week sermon series
 * called "Walking in Faith". Posts optionally reference a series.
 *
 * This allows future features like:
 * - "Next in this series" navigation on post pages
 * - A /series/[slug] page showing all parts in order
 */
import { defineField, defineType } from "sanity";

export const series = defineType({
  name: "series",
  title: "Series",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Series Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description:
        "A brief description of what this series is about. Shown on the series index page.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "coverImage",
    },
  },
});
