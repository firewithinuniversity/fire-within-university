/**
 * AffiliateProduct schema
 *
 * A product or resource that can be recommended at the bottom of any post.
 * The team creates these once, then attaches them to posts in Sanity.
 *
 * LEGAL: Every page that shows affiliate products must display the FTC disclosure.
 * That's handled automatically in the component — not manually per post.
 */
import { defineField, defineType } from "sanity";

export const affiliateProduct = defineType({
  name: "affiliateProduct",
  title: "Affiliate Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      description: "1-2 sentences explaining why you recommend this resource.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "affiliateUrl",
      title: "Affiliate Link URL",
      type: "url",
      description: "The full affiliate URL (e.g. Amazon affiliate link).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "disclosureText",
      title: "Custom Disclosure Text (optional)",
      type: "string",
      description:
        "Overrides the default FTC disclosure for this specific product if needed.",
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "affiliateUrl",
      media: "image",
    },
  },
});
