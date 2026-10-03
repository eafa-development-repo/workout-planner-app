import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Screens pushed above the bottom tabs (forms, details, pickers). */
export type RootStackParamList = {
  Tabs: undefined;
  ProfileForm: undefined;
  WeightForm: { recordId?: number } | undefined;
  ExerciseForm: { exerciseId?: number } | undefined;
  ExercisePicker: undefined;
  WorkoutForm: { workoutId?: number } | undefined;
  WorkoutDetail: { workoutId: number };
  FoodForm: { foodId?: number } | undefined;
  FoodPicker: undefined;
  MealForm: { mealId?: number } | undefined;
  MealDetail: { mealId: number };
};

export type TabParamList = {
  User: undefined;
  Workout: undefined;
  Diet: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
