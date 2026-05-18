/**
 * Category schema
 *
 * A simple tag used to filter posts. The two main values are:
 * "sermon" and "article" — but the content team can add more.
 *
 * Stored as a separate document (not just a string) so categories
 * can have slugs for future filtering pages like /blog/category/sermons.
 */
import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Sermon", "Article", "Devotional"',
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
      rows: 2,
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
