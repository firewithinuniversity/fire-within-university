/**
 * lib/sanity/image.ts — Sanity image URL builder
 *
 * Images in Sanity are stored as references (not raw URLs).
 * A Sanity image object looks like: { asset: { _ref: "image-abc123-800x600-jpg" } }
 *
 * This helper converts that reference into a real CDN URL with transformations:
 * - Resize on the fly: imageUrlFor(img).width(800).url()
 * - Crop to a square: imageUrlFor(img).width(300).height(300).fit("crop").url()
 * - Auto-format (WebP where supported): imageUrlFor(img).auto("format").url()
 *
 * The actual URL looks like:
 * https://cdn.sanity.io/images/projectId/dataset/filename-800x600.jpg?auto=format
 */
import { createImageUrlBuilder as imageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

export function imageUrlFor(source: SanityImageSource) {
  return builder.image(source);
}
