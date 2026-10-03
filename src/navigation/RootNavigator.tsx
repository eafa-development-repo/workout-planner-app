import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import { FoodFormScreen } from '../screens/diet/FoodFormScreen';
import { FoodPickerScreen } from '../screens/diet/FoodPickerScreen';
import { MealDetailScreen } from '../screens/diet/MealDetailScreen';
import { MealFormScreen } from '../screens/diet/MealFormScreen';
import { ProfileFormScreen } from '../screens/user/ProfileFormScreen';
import { WeightFormScreen } from '../screens/user/WeightFormScreen';
import { ExerciseFormScreen } from '../screens/workout/ExerciseFormScreen';
import { ExercisePickerScreen } from '../screens/workout/ExercisePickerScreen';
import { WorkoutDetailScreen } from '../screens/workout/WorkoutDetailScreen';
import { WorkoutFormScreen } from '../screens/workout/WorkoutFormScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { ...typography.heading, color: colors.text },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

export function RootNavigator() {
  const theme = useMemo(() => navigationTheme, []);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />

        <Stack.Screen
          name="ProfileForm"
          component={ProfileFormScreen}
          options={{ title: 'Edit profile' }}
        />
        <Stack.Screen
          name="WeightForm"
          component={WeightFormScreen}
          options={({ route }) => ({
            title: route.params?.recordId ? 'Edit weight' : 'Add weight',
          })}
        />

        <Stack.Screen
          name="WorkoutDetail"
          component={WorkoutDetailScreen}
          options={{ title: 'Workout' }}
        />
        <Stack.Screen
          name="WorkoutForm"
          component={WorkoutFormScreen}
          options={({ route }) => ({
            title: route.params?.workoutId ? 'Edit workout' : 'New workout',
          })}
        />
        <Stack.Screen
          name="ExerciseForm"
          component={ExerciseFormScreen}
          options={({ route }) => ({
            title: route.params?.exerciseId ? 'Edit exercise' : 'New exercise',
          })}
        />
        <Stack.Screen
          name="ExercisePicker"
          component={ExercisePickerScreen}
          options={{ title: 'Select exercise', presentation: 'modal' }}
        />

        <Stack.Screen
          name="MealDetail"
          component={MealDetailScreen}
          options={{ title: 'Meal' }}
        />
        <Stack.Screen
          name="MealForm"
          component={MealFormScreen}
          options={({ route }) => ({
            title: route.params?.mealId ? 'Edit meal' : 'New meal',
          })}
        />
        <Stack.Screen
          name="FoodForm"
          component={FoodFormScreen}
          options={({ route }) => ({
            title: route.params?.foodId ? 'Edit food' : 'New food',
          })}
        />
        <Stack.Screen
          name="FoodPicker"
          component={FoodPickerScreen}
          options={{ title: 'Select food', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
