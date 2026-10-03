import { getDatabase } from '../db/database';
import type { Exercise, MuscleGroup } from '../db/types';
import { nowIso } from '../utils/date';
import { deleteStoredImage } from '../utils/imageStorage';

interface ExerciseRow {
  id: number;
  name: string;
  muscle_group: string;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group as MuscleGroup,
    photoUri: row.photo_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ExerciseInput {
  name: string;
  muscleGroup: MuscleGroup;
  photoUri: string | null;
}

export interface ExerciseUsage {
  /** Workouts that currently reference this exercise. */
  workoutCount: number;
  workoutNames: string[];
}

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM exercises ORDER BY name COLLATE NOCASE ASC;',
  );
  return rows.map(mapRow);
}

export async function getExercise(id: number): Promise<Exercise | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExerciseRow>('SELECT * FROM exercises WHERE id = ?;', id);
  return row ? mapRow(row) : null;
}

export async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const db = await getDatabase();
  const timestamp = nowIso();
  const result = await db.runAsync(
    'INSERT INTO exercises (name, muscle_group, photo_uri, created_at, updated_at) VALUES (?, ?, ?, ?, ?);',
    input.name,
    input.muscleGroup,
    input.photoUri,
    timestamp,
    timestamp,
  );
  const created = await getExercise(result.lastInsertRowId);
  if (!created) throw new Error('Exercise could not be created.');
  return created;
}

export async function updateExercise(id: number, input: ExerciseInput): Promise<Exercise> {
  const db = await getDatabase();
  const existing = await getExercise(id);
  if (!existing) throw new Error('Exercise no longer exists.');

  await db.runAsync(
    'UPDATE exercises SET name = ?, muscle_group = ?, photo_uri = ?, updated_at = ? WHERE id = ?;',
    input.name,
    input.muscleGroup,
    input.photoUri,
    nowIso(),
    id,
  );

  // The old photo is only discarded once the new record is safely stored.
  if (existing.photoUri && existing.photoUri !== input.photoUri) {
    deleteStoredImage(existing.photoUri);
  }

  const updated = await getExercise(id);
  if (!updated) throw new Error('Exercise could not be updated.');
  return updated;
}

/** How many workouts reference an exercise, so the UI can warn before deleting. */
export async function getExerciseUsage(id: number): Promise<ExerciseUsage> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ name: string; workout_count: number }>(
    `SELECT w.name AS name, COUNT(*) AS workout_count
       FROM workout_exercises we
       JOIN workouts w ON w.id = we.workout_id
      WHERE we.exercise_id = ?
      GROUP BY w.id
      ORDER BY w.name COLLATE NOCASE ASC;`,
    id,
  );
  return {
    workoutCount: rows.reduce((total, row) => total + row.workout_count, 0),
    workoutNames: rows.map((row) => row.name),
  };
}

export async function deleteExercise(id: number): Promise<void> {
  const db = await getDatabase();
  const existing = await getExercise(id);
  if (!existing) return;

  // workout_exercises rows cascade away with the exercise, so no workout is
  // left holding a reference to a missing exercise.
  await db.runAsync('DELETE FROM exercises WHERE id = ?;', id);
  deleteStoredImage(existing.photoUri);
}

export async function isExerciseNameTaken(name: string, exceptId?: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM exercises WHERE name = ? COLLATE NOCASE AND id IS NOT ?;',
    name,
    exceptId ?? null,
  );
  return (row?.count ?? 0) > 0;
}
