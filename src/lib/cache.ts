import { unstable_cache } from "next/cache";

/**
 * Reusable cache wrapper for database queries.
 * - Categories: rarely change, cache 5 minutes
 * - Landing stats: cache 1 minute (already ISR'd)
 * - Package list (without user data): cache 30 seconds
 */

export function cachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: { revalidate?: number; tags?: string[] }
): () => Promise<T> {
  return unstable_cache(fn, keyParts, {
    revalidate: options?.revalidate ?? 60,
    tags: options?.tags,
  });
}
