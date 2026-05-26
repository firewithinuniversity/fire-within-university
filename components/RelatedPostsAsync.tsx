import { getRelatedPosts } from "@/lib/sanity/queries";
import RelatedPosts from "./RelatedPosts";

/**
 * Server component that fetches related posts independently.
 * Designed to be wrapped in <Suspense> so the main article
 * streams to the client without waiting for this query.
 */
type Props = {
  slug: string;
  categoryId: string | undefined;
};

export default async function RelatedPostsAsync({ slug, categoryId }: Props) {
  const relatedPosts = await getRelatedPosts(slug, categoryId);
  return <RelatedPosts posts={relatedPosts} />;
}
