import type { MeasurementType, MuscleGroup } from '../db/types';

export interface SeedExercise {
  name: string;
  muscleGroup: MuscleGroup;
}

export interface SeedFood {
  name: string;
  measurementType: MeasurementType;
  measureQuantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

/**
 * A compact starter database so every screen is usable on first launch.
 * Values are typical per the food's own measure (100 g or 1 unit) and are
 * editable by the user once seeded.
 */
export const SEED_EXERCISES: SeedExercise[] = [
  { name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { name: 'Cable Fly', muscleGroup: 'Chest' },
  { name: 'Barbell Back Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { name: 'Walking Lunge', muscleGroup: 'Legs' },
  { name: 'Standing Calf Raise', muscleGroup: 'Legs' },
  { name: 'Pull-Up', muscleGroup: 'Lats' },
  { name: 'Lat Pulldown', muscleGroup: 'Lats' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },
  { name: 'Triceps Pushdown', muscleGroup: 'Triceps' },
  { name: 'Overhead Triceps Extension', muscleGroup: 'Triceps' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { name: 'Hanging Leg Raise', muscleGroup: 'Abs' },
  { name: 'Cable Crunch', muscleGroup: 'Abs' },
  { name: 'Plank', muscleGroup: 'Abs' },
  { name: 'Wrist Curl', muscleGroup: 'Forearms' },
  { name: 'Farmer Carry', muscleGroup: 'Forearms' },
];

export const SEED_FOODS: SeedFood[] = [
  { name: 'Chicken Breast', measurementType: 'grams', measureQuantity: 100, protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  { name: 'Chicken Thigh', measurementType: 'grams', measureQuantity: 100, protein: 24.8, carbs: 0, fat: 8.2, calories: 177 },
  { name: 'Lean Beef Mince', measurementType: 'grams', measureQuantity: 100, protein: 26, carbs: 0, fat: 10, calories: 198 },
  { name: 'Salmon Fillet', measurementType: 'grams', measureQuantity: 100, protein: 22, carbs: 0, fat: 12, calories: 208 },
  { name: 'Tuna (canned, drained)', measurementType: 'grams', measureQuantity: 100, protein: 25.5, carbs: 0, fat: 0.8, calories: 116 },
  { name: 'White Fish', measurementType: 'grams', measureQuantity: 100, protein: 20.5, carbs: 0, fat: 2.5, calories: 105 },
  { name: 'Shrimp', measurementType: 'grams', measureQuantity: 100, protein: 24, carbs: 0.2, fat: 0.3, calories: 99 },
  { name: 'Whole Egg', measurementType: 'units', measureQuantity: 1, protein: 6.3, carbs: 0.4, fat: 4.8, calories: 70 },
  { name: 'Egg White', measurementType: 'grams', measureQuantity: 100, protein: 10.9, carbs: 0.7, fat: 0.2, calories: 52 },
  { name: 'Greek Yogurt (0% fat)', measurementType: 'grams', measureQuantity: 100, protein: 10, carbs: 3.6, fat: 0.4, calories: 59 },
  { name: 'Cottage Cheese', measurementType: 'grams', measureQuantity: 100, protein: 11, carbs: 3.4, fat: 4.3, calories: 98 },
  { name: 'Whey Protein Powder', measurementType: 'grams', measureQuantity: 100, protein: 80, carbs: 8, fat: 6, calories: 400 },
  { name: 'Whole Milk', measurementType: 'grams', measureQuantity: 100, protein: 3.2, carbs: 4.8, fat: 3.3, calories: 61 },
  { name: 'Skim Milk', measurementType: 'grams', measureQuantity: 100, protein: 3.4, carbs: 5, fat: 0.1, calories: 34 },
  { name: 'Cheddar Cheese', measurementType: 'grams', measureQuantity: 100, protein: 25, carbs: 1.3, fat: 33, calories: 403 },
  { name: 'White Rice (cooked)', measurementType: 'grams', measureQuantity: 100, protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  { name: 'Brown Rice (cooked)', measurementType: 'grams', measureQuantity: 100, protein: 2.6, carbs: 23, fat: 0.9, calories: 112 },
  { name: 'Pasta (cooked)', measurementType: 'grams', measureQuantity: 100, protein: 5.8, carbs: 31, fat: 0.9, calories: 158 },
  { name: 'Oats (dry)', measurementType: 'grams', measureQuantity: 100, protein: 13.2, carbs: 68, fat: 6.5, calories: 379 },
  { name: 'Potato (boiled)', measurementType: 'grams', measureQuantity: 100, protein: 2, carbs: 20, fat: 0.2, calories: 87 },
  { name: 'Sweet Potato', measurementType: 'grams', measureQuantity: 100, protein: 1.6, carbs: 20, fat: 0.1, calories: 86 },
  { name: 'Whole Wheat Bread', measurementType: 'units', measureQuantity: 1, protein: 4, carbs: 14, fat: 1.5, calories: 80 },
  { name: 'Tortilla', measurementType: 'units', measureQuantity: 1, protein: 2.5, carbs: 15, fat: 2, calories: 90 },
  { name: 'Pasta Serving', measurementType: 'units', measureQuantity: 1, protein: 12, carbs: 60, fat: 2, calories: 310 },
  { name: 'Banana', measurementType: 'units', measureQuantity: 1, protein: 1.3, carbs: 27, fat: 0.3, calories: 105 },
  { name: 'Apple', measurementType: 'units', measureQuantity: 1, protein: 0.5, carbs: 25, fat: 0.3, calories: 95 },
  { name: 'Orange', measurementType: 'units', measureQuantity: 1, protein: 1.2, carbs: 15, fat: 0.2, calories: 62 },
  { name: 'Blueberries', measurementType: 'grams', measureQuantity: 100, protein: 0.7, carbs: 14, fat: 0.3, calories: 57 },
  { name: 'Broccoli', measurementType: 'grams', measureQuantity: 100, protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  { name: 'Spinach', measurementType: 'grams', measureQuantity: 100, protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23 },
  { name: 'Mixed Salad Greens', measurementType: 'grams', measureQuantity: 100, protein: 1.5, carbs: 4, fat: 0.2, calories: 20 },
  { name: 'Green Beans', measurementType: 'grams', measureQuantity: 100, protein: 1.8, carbs: 7, fat: 0.2, calories: 31 },
  { name: 'Carrots', measurementType: 'grams', measureQuantity: 100, protein: 0.9, carbs: 10, fat: 0.2, calories: 41 },
  { name: 'Avocado', measurementType: 'units', measureQuantity: 1, protein: 2, carbs: 12, fat: 15, calories: 240 },
  { name: 'Almonds', measurementType: 'grams', measureQuantity: 100, protein: 21, carbs: 22, fat: 50, calories: 579 },
  { name: 'Peanut Butter', measurementType: 'grams', measureQuantity: 100, protein: 25, carbs: 20, fat: 50, calories: 588 },
  { name: 'Olive Oil', measurementType: 'grams', measureQuantity: 100, protein: 0, carbs: 0, fat: 100, calories: 884 },
  { name: 'Butter', measurementType: 'grams', measureQuantity: 100, protein: 0.9, carbs: 0.1, fat: 81, calories: 717 },
  { name: 'Honey', measurementType: 'grams', measureQuantity: 100, protein: 0.3, carbs: 82, fat: 0, calories: 304 },
  { name: 'Dark Chocolate (70%)', measurementType: 'grams', measureQuantity: 100, protein: 8, carbs: 45, fat: 40, calories: 546 },
  { name: 'Rice Cake', measurementType: 'units', measureQuantity: 1, protein: 0.3, carbs: 7, fat: 0.2, calories: 35 },
  { name: 'Protein Bar', measurementType: 'units', measureQuantity: 1, protein: 20, carbs: 30, fat: 8, calories: 220 },
];
