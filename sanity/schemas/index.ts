/**
 * sanity/schemas/index.ts
 *
 * Exports all schema types as a single array.
 * This array is imported by the Sanity config and registers every content type.
 *
 * To add a new content type:
 * 1. Create a new file in /sanity/schemas/
 * 2. Import it here and add it to the array
 */
import { post } from "./post";
import { author } from "./author";
import { category } from "./category";
import { series } from "./series";
import { affiliateProduct } from "./affiliateProduct";
import { testimonial } from "./testimonial";

export const schemaTypes = [post, author, category, series, affiliateProduct, testimonial];
