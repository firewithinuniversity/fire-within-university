import { defineType, defineField } from "sanity";

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lessonNumber",
      title: "Lesson Number",
      type: "number",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "downloads",
      title: "Downloads",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "fileUrl", title: "File URL", type: "url" }),
          ],
        },
      ],
    }),
    defineField({
      name: "scripture",
      title: "Scripture Reference",
      type: "string",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "scripture" },
  },
});
