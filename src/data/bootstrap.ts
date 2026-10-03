import { getDatabase, withTransaction } from '../db/database';
import { SEED_EXERCISES, SEED_FOODS } from '../data/seedData';
import { nowIso } from '../utils/date';
import { ensureUserExists } from '../repositories/userRepository';

let bootstrapPromise: Promise<void> | null = null;

async function seedIfEmpty(): Promise<void> {
  await getDatabase();
  const timestamp = nowIso();

  await withTransaction(async (txn) => {
    const exerciseCount = await txn.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM exercises;',
    );
    if (!exerciseCount || exerciseCount.count === 0) {
      for (const exercise of SEED_EXERCISES) {
        await txn.runAsync(
          'INSERT INTO exercises (name, muscle_group, photo_uri, created_at, updated_at) VALUES (?, ?, NULL, ?, ?);',
          exercise.name,
          exercise.muscleGroup,
          timestamp,
          timestamp,
        );
      }
    }

    const foodCount = await txn.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM foods;',
    );
    if (!foodCount || foodCount.count === 0) {
      for (const food of SEED_FOODS) {
        await txn.runAsync(
          `INSERT INTO foods (name, measurement_type, measure_quantity, protein, carbs, fat, calories, photo_uri, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?);`,
          food.name,
          food.measurementType,
          food.measureQuantity,
          food.protein,
          food.carbs,
          food.fat,
          food.calories,
          timestamp,
          timestamp,
        );
      }
    }
  });
}

/**
 * Prepares the local database on first launch. Idempotent: repeated calls are
 * cheap and never duplicate the starter data.
 */
export function bootstrapDatabase(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await getDatabase();
      await ensureUserExists();
      await seedIfEmpty();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}
