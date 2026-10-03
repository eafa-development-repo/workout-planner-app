import { getDatabase } from '../db/database';
import type { WeightRecord } from '../db/types';
import { nowIso } from '../utils/date';

interface WeightRow {
  id: number;
  user_id: number;
  weight: number;
  recorded_at: string;
  created_at: string;
}

function mapRow(row: WeightRow): WeightRecord {
  return {
    id: row.id,
    userId: row.user_id,
    weight: row.weight,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
  };
}

/** Newest record first. */
export async function listWeightHistory(userId: number): Promise<WeightRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WeightRow>(
    'SELECT * FROM weight_history WHERE user_id = ? ORDER BY recorded_at DESC, id DESC;',
    userId,
  );
  return rows.map(mapRow);
}

export async function getWeightRecord(id: number): Promise<WeightRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WeightRow>('SELECT * FROM weight_history WHERE id = ?;', id);
  return row ? mapRow(row) : null;
}

export async function createWeightRecord(
  userId: number,
  weight: number,
  recordedAt: string,
): Promise<WeightRecord> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO weight_history (user_id, weight, recorded_at, created_at) VALUES (?, ?, ?, ?);',
    userId,
    weight,
    recordedAt,
    nowIso(),
  );
  const created = await getWeightRecord(result.lastInsertRowId);
  if (!created) throw new Error('Weight record could not be saved.');
  return created;
}

export async function updateWeightRecord(
  id: number,
  weight: number,
  recordedAt: string,
): Promise<WeightRecord> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE weight_history SET weight = ?, recorded_at = ? WHERE id = ?;',
    weight,
    recordedAt,
    id,
  );
  const updated = await getWeightRecord(id);
  if (!updated) throw new Error('Weight record could not be updated.');
  return updated;
}

export async function deleteWeightRecord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weight_history WHERE id = ?;', id);
}
