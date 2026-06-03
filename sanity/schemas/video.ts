import { defineType, defineField } from "sanity";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  icon: () => "🎬",
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
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "Paste the full YouTube video URL (e.g., https://www.youtube.com/watch?v=XXXXX)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "thumbnail",
      title: "Custom Thumbnail",
      type: "image",
      description: "Optional — if not set, the YouTube thumbnail will be used automatically.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Sermon", value: "sermon" },
          { title: "Devotional", value: "devotional" },
          { title: "Teaching", value: "teaching" },
          { title: "Testimony", value: "testimony" },
          { title: "Worship", value: "worship" },
          { title: "Clip", value: "clip" },
        ],
      },
      initialValue: "sermon",
    }),
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "string",
      initialValue: "Brett & Jude",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "e.g., '25 min' or '1:05:30'",
    }),
    defineField({
      name: "scripture",
      title: "Scripture Reference",
      type: "string",
      description: "e.g., 'John 3:16-17'",
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: true,
      description: "Show this video in the Latest Videos section on the homepage.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "thumbnail",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : "Video",
        media,
      };
    },
  },
});
