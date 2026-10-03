import { getDatabase, withTransaction } from '../db/database';
import type { Workout, WorkoutExerciseDetail } from '../db/types';
import { nowIso } from '../utils/date';

interface WorkoutRow {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  exercise_count: number;
}

interface WorkoutExerciseRow {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
  position: number;
  exercise_name: string;
  muscle_group: string;
  photo_uri: string | null;
}

function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exerciseCount: row.exercise_count,
  };
}

export async function listWorkouts(): Promise<Workout[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutRow>(
    `SELECT w.*, (SELECT COUNT(*) FROM workout_exercises we WHERE we.workout_id = w.id) AS exercise_count
       FROM workouts w
      ORDER BY w.updated_at DESC, w.id DESC;`,
  );
  return rows.map(mapWorkout);
}

export async function getWorkout(id: number): Promise<Workout | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutRow>(
    `SELECT w.*, (SELECT COUNT(*) FROM workout_exercises we WHERE we.workout_id = w.id) AS exercise_count
       FROM workouts w
      WHERE w.id = ?;`,
    id,
  );
  return row ? mapWorkout(row) : null;
}

export async function listWorkoutExercises(workoutId: number): Promise<WorkoutExerciseDetail[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutExerciseRow>(
    `SELECT we.*, e.name AS exercise_name, e.muscle_group, e.photo_uri
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
      WHERE we.workout_id = ?
      ORDER BY we.position ASC, we.id ASC;`,
    workoutId,
  );
  return rows.map((row) => ({
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    notes: row.notes,
    position: row.position,
    exerciseName: row.exercise_name,
    muscleGroup: row.muscle_group as WorkoutExerciseDetail['muscleGroup'],
    photoUri: row.photo_uri,
  }));
}

export interface WorkoutExerciseInput {
  exerciseId: number;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
}

export interface WorkoutInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
  exercises: WorkoutExerciseInput[];
}

/**
 * Writes the workout header and replaces its exercise rows atomically, so a
 * failure can never leave a workout with a half written exercise list.
 */
async function replaceExercises(
  txn: Awaited<ReturnType<typeof getDatabase>>,
  workoutId: number,
  exercises: WorkoutExerciseInput[],
): Promise<void> {
  await txn.runAsync('DELETE FROM workout_exercises WHERE workout_id = ?;', workoutId);
  for (const [index, entry] of exercises.entries()) {
    await txn.runAsync(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes, position)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      workoutId,
      entry.exerciseId,
      entry.sets,
      entry.reps,
      entry.weight,
      entry.notes,
      index,
    );
  }
}

export async function createWorkout(input: WorkoutInput): Promise<Workout> {
  const timestamp = nowIso();
  let newId = 0;

  await withTransaction(async (txn) => {
    const result = await txn.runAsync(
      'INSERT INTO workouts (name, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?);',
      input.name,
      input.startDate,
      input.endDate,
      timestamp,
      timestamp,
    );
    newId = result.lastInsertRowId;
    await replaceExercises(txn, newId, input.exercises);
  });

  const created = await getWorkout(newId);
  if (!created) throw new Error('Workout could not be created.');
  return created;
}

export async function updateWorkout(id: number, input: WorkoutInput): Promise<Workout> {
  await withTransaction(async (txn) => {
    await txn.runAsync(
      'UPDATE workouts SET name = ?, start_date = ?, end_date = ?, updated_at = ? WHERE id = ?;',
      input.name,
      input.startDate,
      input.endDate,
      nowIso(),
      id,
    );
    await replaceExercises(txn, id, input.exercises);
  });

  const updated = await getWorkout(id);
  if (!updated) throw new Error('Workout could not be updated.');
  return updated;
}

export async function deleteWorkout(id: number): Promise<void> {
  const db = await getDatabase();
  // workout_exercises rows cascade away with the workout.
  await db.runAsync('DELETE FROM workouts WHERE id = ?;', id);
}
