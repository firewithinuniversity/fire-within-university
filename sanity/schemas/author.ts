/**
 * Author schema
 *
 * Represents a ministry team member or writer.
 * Posts reference authors — multiple authors can exist,
 * and each post shows the author's photo, name, bio, and role.
 */
import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      description: 'e.g. "Lead Pastor", "Ministry Writer", "Worship Director"',
    }),
    defineField({
      name: "bio",
      title: "Short Bio",
      type: "text",
      rows: 4,
      description: "A 2-4 sentence bio shown on post pages and the About page.",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: {
        // Hotspot lets the content team choose which part of the image stays
        // visible when it's cropped to different aspect ratios (e.g. circle vs square)
        hotspot: true,
      },
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used to link to an author profile page in the future.",
      options: {
        source: "name",
        maxLength: 96,
      },
    }),
  ],

  // This controls how documents appear in the Sanity Studio list view
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});
