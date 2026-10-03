import { getDatabase, withTransaction } from '../db/database';
import type { MacroTotals, Meal, MealFoodDetail } from '../db/types';
import { nowIso } from '../utils/date';

interface MealRow {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  food_count: number;
}

interface MealFoodRow {
  id: number;
  meal_id: number;
  food_id: number;
  quantity: number;
  position: number;
  food_name: string;
  measurement_type: string;
  measure_quantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photo_uri: string | null;
}

const EMPTY_TOTALS: MacroTotals = { protein: 0, carbs: 0, fat: 0, calories: 0 };

function mapRow(row: MealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    foodCount: row.food_count,
  };
}

/**
 * Multiplier applied to a food's per-measure nutrition values.
 * `200 g` of a food defined per `100 g` -> 2x. `3 units` of a food defined per
 * `1 unit` -> 3x.
 */
export function nutritionFactor(quantity: number, measureQuantity: number): number {
  if (!measureQuantity || measureQuantity <= 0) return 0;
  return quantity / measureQuantity;
}

function mapMealFood(row: MealFoodRow): MealFoodDetail {
  return {
    id: row.id,
    mealId: row.meal_id,
    foodId: row.food_id,
    quantity: row.quantity,
    position: row.position,
    foodName: row.food_name,
    measurementType: row.measurement_type as MealFoodDetail['measurementType'],
    measureQuantity: row.measure_quantity,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    calories: row.calories,
    photoUri: row.photo_uri,
    factor: nutritionFactor(row.quantity, row.measure_quantity),
  };
}

export async function listMeals(): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MealRow>(
    `SELECT m.*, (SELECT COUNT(*) FROM meal_foods mf WHERE mf.meal_id = m.id) AS food_count
       FROM meals m
      ORDER BY m.updated_at DESC, m.id DESC;`,
  );
  return rows.map(mapRow);
}

export async function getMeal(id: number): Promise<Meal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MealRow>(
    `SELECT m.*, (SELECT COUNT(*) FROM meal_foods mf WHERE mf.meal_id = m.id) AS food_count
       FROM meals m
      WHERE m.id = ?;`,
    id,
  );
  return row ? mapRow(row) : null;
}

export async function listMealFoods(mealId: number): Promise<MealFoodDetail[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MealFoodRow>(
    `SELECT mf.*, f.name AS food_name, f.measurement_type, f.measure_quantity,
            f.protein, f.carbs, f.fat, f.calories, f.photo_uri
       FROM meal_foods mf
       JOIN foods f ON f.id = mf.food_id
      WHERE mf.meal_id = ?
      ORDER BY mf.position ASC, mf.id ASC;`,
    mealId,
  );
  return rows.map(mapMealFood);
}

/** Sums a list of meal foods into meal level totals. */
export function sumMacros(items: Pick<MealFoodDetail, 'factor' | 'protein' | 'carbs' | 'fat' | 'calories'>[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (totals, item) => ({
      protein: totals.protein + item.protein * item.factor,
      carbs: totals.carbs + item.carbs * item.factor,
      fat: totals.fat + item.fat * item.factor,
      calories: totals.calories + item.calories * item.factor,
    }),
    { ...EMPTY_TOTALS },
  );
}

export interface MealFoodInput {
  foodId: number;
  quantity: number;
}

export interface MealInput {
  name: string;
  foods: MealFoodInput[];
}

async function replaceFoods(
  txn: Awaited<ReturnType<typeof getDatabase>>,
  mealId: number,
  foods: MealFoodInput[],
): Promise<void> {
  await txn.runAsync('DELETE FROM meal_foods WHERE meal_id = ?;', mealId);
  for (const [index, entry] of foods.entries()) {
    await txn.runAsync(
      'INSERT INTO meal_foods (meal_id, food_id, quantity, position) VALUES (?, ?, ?, ?);',
      mealId,
      entry.foodId,
      entry.quantity,
      index,
    );
  }
}

export async function createMeal(input: MealInput): Promise<Meal> {
  const timestamp = nowIso();
  let newId = 0;

  await withTransaction(async (txn) => {
    const result = await txn.runAsync(
      'INSERT INTO meals (name, created_at, updated_at) VALUES (?, ?, ?);',
      input.name,
      timestamp,
      timestamp,
    );
    newId = result.lastInsertRowId;
    await replaceFoods(txn, newId, input.foods);
  });

  const created = await getMeal(newId);
  if (!created) throw new Error('Meal could not be created.');
  return created;
}

export async function updateMeal(id: number, input: MealInput): Promise<Meal> {
  await withTransaction(async (txn) => {
    await txn.runAsync(
      'UPDATE meals SET name = ?, updated_at = ? WHERE id = ?;',
      input.name,
      nowIso(),
      id,
    );
    await replaceFoods(txn, id, input.foods);
  });

  const updated = await getMeal(id);
  if (!updated) throw new Error('Meal could not be updated.');
  return updated;
}

export async function deleteMeal(id: number): Promise<void> {
  const db = await getDatabase();
  // meal_foods rows cascade away with the meal.
  await db.runAsync('DELETE FROM meals WHERE id = ?;', id);
}

export { EMPTY_TOTALS };
