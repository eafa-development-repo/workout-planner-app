import { getDatabase } from '../db/database';
import type { Food, MeasurementType } from '../db/types';
import { nowIso } from '../utils/date';
import { deleteStoredImage } from '../utils/imageStorage';

interface FoodRow {
  id: number;
  name: string;
  measurement_type: string;
  measure_quantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    measurementType: row.measurement_type as MeasurementType,
    measureQuantity: row.measure_quantity,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    calories: row.calories,
    photoUri: row.photo_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface FoodInput {
  name: string;
  measurementType: MeasurementType;
  measureQuantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photoUri: string | null;
}

export interface FoodUsage {
  mealCount: number;
  mealNames: string[];
}

export async function listFoods(): Promise<Food[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FoodRow>('SELECT * FROM foods ORDER BY name COLLATE NOCASE ASC;');
  return rows.map(mapRow);
}

export async function getFood(id: number): Promise<Food | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<FoodRow>('SELECT * FROM foods WHERE id = ?;', id);
  return row ? mapRow(row) : null;
}

export async function createFood(input: FoodInput): Promise<Food> {
  const db = await getDatabase();
  const timestamp = nowIso();
  const result = await db.runAsync(
    `INSERT INTO foods (name, measurement_type, measure_quantity, protein, carbs, fat, calories, photo_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    input.name,
    input.measurementType,
    input.measureQuantity,
    input.protein,
    input.carbs,
    input.fat,
    input.calories,
    input.photoUri,
    timestamp,
    timestamp,
  );
  const created = await getFood(result.lastInsertRowId);
  if (!created) throw new Error('Food could not be created.');
  return created;
}

export async function updateFood(id: number, input: FoodInput): Promise<Food> {
  const db = await getDatabase();
  const existing = await getFood(id);
  if (!existing) throw new Error('Food no longer exists.');

  await db.runAsync(
    `UPDATE foods
        SET name = ?, measurement_type = ?, measure_quantity = ?, protein = ?, carbs = ?, fat = ?, calories = ?, photo_uri = ?, updated_at = ?
      WHERE id = ?;`,
    input.name,
    input.measurementType,
    input.measureQuantity,
    input.protein,
    input.carbs,
    input.fat,
    input.calories,
    input.photoUri,
    nowIso(),
    id,
  );

  if (existing.photoUri && existing.photoUri !== input.photoUri) {
    deleteStoredImage(existing.photoUri);
  }

  const updated = await getFood(id);
  if (!updated) throw new Error('Food could not be updated.');
  return updated;
}

export async function getFoodUsage(id: number): Promise<FoodUsage> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ name: string; meal_count: number }>(
    `SELECT m.name AS name, COUNT(*) AS meal_count
       FROM meal_foods mf
       JOIN meals m ON m.id = mf.meal_id
      WHERE mf.food_id = ?
      GROUP BY m.id
      ORDER BY m.name COLLATE NOCASE ASC;`,
    id,
  );
  return {
    mealCount: rows.reduce((total, row) => total + row.meal_count, 0),
    mealNames: rows.map((row) => row.name),
  };
}

export async function deleteFood(id: number): Promise<void> {
  const db = await getDatabase();
  const existing = await getFood(id);
  if (!existing) return;

  // meal_foods rows cascade away with the food, so no meal keeps a dangling reference.
  await db.runAsync('DELETE FROM foods WHERE id = ?;', id);
  deleteStoredImage(existing.photoUri);
}

export async function isFoodNameTaken(name: string, exceptId?: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM foods WHERE name = ? COLLATE NOCASE AND id IS NOT ?;',
    name,
    exceptId ?? null,
  );
  return (row?.count ?? 0) > 0;
}
