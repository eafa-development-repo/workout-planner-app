/** Muscle groups available when creating an exercise. */
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Abs',
  'Biceps',
  'Triceps',
  'Shoulders',
  'Lats',
  'Legs',
  'Forearms',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** How a food's nutrition is measured when added to a meal. */
export const MEASUREMENT_TYPES = ['grams', 'units'] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

/** Human readable label + singular form for a measurement type. */
export const MEASUREMENT_LABEL: Record<MeasurementType, string> = {
  grams: 'grams',
  units: 'units',
};

export const MEASUREMENT_SHORT: Record<MeasurementType, string> = {
  grams: 'g',
  units: 'unit',
};

/** Default base quantity a food's nutrition values are defined for. */
export const DEFAULT_MEASURE_QUANTITY: Record<MeasurementType, number> = {
  grams: 100,
  units: 1,
};

export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const;
export type Sex = (typeof SEX_OPTIONS)[number];

export interface User {
  id: number;
  name: string;
  sex: Sex | null;
  goal: string | null;
  currentWeight: number | null;
  height: number | null;
  age: number | null;
  updatedAt: string;
}

export interface WeightRecord {
  id: number;
  userId: number;
  weight: number;
  recordedAt: string;
  createdAt: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  photoUri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  /** Number of exercise rows attached to this workout. */
  exerciseCount: number;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
  position: number;
}

/** A workout exercise joined with its exercise definition, for display. */
export interface WorkoutExerciseDetail extends WorkoutExercise {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  photoUri: string | null;
}

export interface Food {
  id: number;
  name: string;
  measurementType: MeasurementType;
  /** Nutrition is defined for `measureQuantity` of the measurement type. */
  measureQuantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photoUri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** Macros and calories of the whole meal, already scaled by quantity. */
  totals: MacroTotals;
}

export interface MealFood {
  id: number;
  mealId: number;
  foodId: number;
  quantity: number;
  position: number;
}

/** A meal food joined with the food definition and the computed macros. */
export interface MealFoodDetail extends MealFood {
  foodName: string;
  measurementType: MeasurementType;
  measureQuantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photoUri: string | null;
  /** quantity / measureQuantity — the multiplier applied to the food macros. */
  factor: number;
}

export interface MacroTotals {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}
