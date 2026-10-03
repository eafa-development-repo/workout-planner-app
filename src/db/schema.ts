/**
 * Schema definition and forward-only migrations.
 *
 * Relational model:
 *   users 1---* weight_history
 *   workouts 1---* workout_exercises *---1 exercises
 *   meals   1---* meal_foods       *---1 foods
 *
 * Deletion rules keep the graph referentially valid at all times:
 *   - Deleting a user removes their weight history (CASCADE).
 *   - Deleting a workout removes its exercise rows (CASCADE).
 *   - Deleting a meal removes its food rows (CASCADE).
 *   - Deleting an exercise / food removes the rows that reference it (CASCADE),
 *     so no workout or meal is ever left pointing at a missing definition.
 *     The UI surfaces how many records are affected before confirming.
 */
export interface Migration {
  version: number;
  statements: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sex TEXT,
        goal TEXT,
        current_weight REAL,
        height REAL,
        age INTEGER,
        updated_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS weight_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL NOT NULL CHECK (weight > 0),
        recorded_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        muscle_group TEXT NOT NULL,
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER NOT NULL CHECK (sets > 0),
        reps INTEGER NOT NULL CHECK (reps > 0),
        weight REAL,
        notes TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        measurement_type TEXT NOT NULL CHECK (measurement_type IN ('grams', 'units')),
        measure_quantity REAL NOT NULL DEFAULT 100 CHECK (measure_quantity > 0),
        protein REAL NOT NULL DEFAULT 0 CHECK (protein >= 0),
        carbs REAL NOT NULL DEFAULT 0 CHECK (carbs >= 0),
        fat REAL NOT NULL DEFAULT 0 CHECK (fat >= 0),
        calories REAL NOT NULL DEFAULT 0 CHECK (calories >= 0),
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS meal_foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity REAL NOT NULL CHECK (quantity > 0),
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name ON exercises (name COLLATE NOCASE);`,
      `CREATE INDEX IF NOT EXISTS idx_weight_history_user ON weight_history (user_id, recorded_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises (workout_id, position);`,
      `CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises (exercise_id);`,
      `CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods (meal_id, position);`,
      `CREATE INDEX IF NOT EXISTS idx_meal_foods_food ON meal_foods (food_id);`,
    ],
  },
];

/** Tables that must exist for the app to run. Used by the integrity check. */
export const EXPECTED_TABLES = [
  'users',
  'weight_history',
  'exercises',
  'workouts',
  'workout_exercises',
  'foods',
  'meals',
  'meal_foods',
] as const;
