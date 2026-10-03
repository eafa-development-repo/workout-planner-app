import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

import { EXPECTED_TABLES, MIGRATIONS } from './schema';

const DATABASE_NAME = 'workout-planner.db';

let instance: SQLiteDatabase | null = null;
let opening: Promise<SQLiteDatabase> | null = null;

async function applyMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL);',
  );

  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations;',
  );
  const appliedVersions = new Set(applied.map((row) => row.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) continue;

    await db.withExclusiveTransactionAsync(async (txn) => {
      for (const statement of migration.statements) {
        await txn.runAsync(statement);
      }
      await txn.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);',
        migration.version,
        new Date().toISOString(),
      );
    });
  }
}

/**
 * Open (once) and migrate the local SQLite database.
 * Foreign keys are enforced explicitly so the relational model cannot be corrupted.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (instance) return instance;
  if (opening) return opening;

  opening = (async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await applyMigrations(db);
    instance = db;
    return db;
  })();

  try {
    return await opening;
  } finally {
    opening = null;
  }
}

/** Run `task` inside an exclusive write transaction. */
export async function withTransaction<T>(
  task: (txn: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  let result: T;
  await db.withExclusiveTransactionAsync(async (txn) => {
    result = await task(txn);
  });
  return result!;
}

/**
 * Detect orphaned rows. Foreign keys already prevent these, so a non-empty
 * result means the file was corrupted outside the app and should be rebuilt.
 */
export async function findIntegrityIssues(): Promise<string[]> {
  const db = await getDatabase();
  const issues: string[] = [];

  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
  );
  const existing = new Set(tables.map((t) => t.name));

  for (const table of EXPECTED_TABLES) {
    if (!existing.has(table)) issues.push(`Missing table: ${table}`);
  }

  const checks: [string, string][] = [
    [
      'weight_history without a user',
      'SELECT COUNT(*) AS c FROM weight_history w LEFT JOIN users u ON u.id = w.user_id WHERE u.id IS NULL',
    ],
    [
      'workout_exercises without a workout',
      'SELECT COUNT(*) AS c FROM workout_exercises we LEFT JOIN workouts w ON w.id = we.workout_id WHERE w.id IS NULL',
    ],
    [
      'workout_exercises without an exercise',
      'SELECT COUNT(*) AS c FROM workout_exercises we LEFT JOIN exercises e ON e.id = we.exercise_id WHERE e.id IS NULL',
    ],
    [
      'meal_foods without a meal',
      'SELECT COUNT(*) AS c FROM meal_foods mf LEFT JOIN meals m ON m.id = mf.meal_id WHERE m.id IS NULL',
    ],
    [
      'meal_foods without a food',
      'SELECT COUNT(*) AS c FROM meal_foods mf LEFT JOIN foods f ON f.id = mf.food_id WHERE f.id IS NULL',
    ],
  ];

  for (const [label, query] of checks) {
    const row = await db.getFirstAsync<{ c: number }>(query);
    if (row && row.c > 0) issues.push(`${label}: ${row.c}`);
  }

  return issues;
}
