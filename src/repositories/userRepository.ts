import { getDatabase, withTransaction } from '../db/database';
import type { Sex, User } from '../db/types';
import { nowIso } from '../utils/date';

interface UserRow {
  id: number;
  name: string;
  sex: string | null;
  goal: string | null;
  current_weight: number | null;
  height: number | null;
  age: number | null;
  updated_at: string;
}

const DEFAULT_USER_ID = 1;

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    sex: (row.sex as Sex | null) ?? null,
    goal: row.goal,
    currentWeight: row.current_weight,
    height: row.height,
    age: row.age,
    updatedAt: row.updated_at,
  };
}

/**
 * The app is single-user and fully offline, so the profile is a single row with
 * a fixed id. It is created on first launch by `bootstrapDatabase`.
 */
export async function getUser(): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?;', DEFAULT_USER_ID);
  return row ? mapRow(row) : null;
}

export interface UserInput {
  name: string;
  sex: Sex | null;
  goal: string | null;
  currentWeight: number | null;
  height: number | null;
  age: number | null;
}

export async function saveUser(input: UserInput): Promise<User> {
  const timestamp = nowIso();

  await withTransaction(async (txn) => {
    await txn.runAsync(
      `UPDATE users
         SET name = ?, sex = ?, goal = ?, current_weight = ?, height = ?, age = ?, updated_at = ?
       WHERE id = ?;`,
      input.name,
      input.sex,
      input.goal,
      input.currentWeight,
      input.height,
      input.age,
      timestamp,
      DEFAULT_USER_ID,
    );
  });

  const user = await getUser();
  if (!user) throw new Error('Profile could not be saved.');
  return user;
}

export async function ensureUserExists(): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM users WHERE id = ?;',
    DEFAULT_USER_ID,
  );
  if (!row || row.count === 0) {
    await db.runAsync(
      'INSERT INTO users (id, name, sex, goal, current_weight, height, age, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      DEFAULT_USER_ID,
      'Athlete',
      null,
      null,
      null,
      null,
      null,
      nowIso(),
    );
  }
}
