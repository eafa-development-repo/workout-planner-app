import { getDatabase } from '../db/database';
import { ensureUserExists } from '../repositories/userRepository';

let bootstrapPromise: Promise<void> | null = null;

/**
 * Prepares the local database on first launch: it runs the migrations and
 * creates the single local user. No starter content is inserted, so a new
 * install starts with empty libraries and the user builds their own.
 */
export function bootstrapDatabase(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await getDatabase();
      await ensureUserExists();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}
