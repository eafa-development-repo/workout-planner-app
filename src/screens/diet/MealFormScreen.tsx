import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { Button, LoadingState } from '../../components/Button';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { MacroTotalsCard } from '../../components/MacroSummary';
import { TextField } from '../../components/TextField';
import { useAppEvent, useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { Food, MacroTotals } from '../../db/types';
import type { RootStackScreenProps } from '../../navigation/types';
import { createMeal, getMeal, listMealFoods, sumMacros, updateMeal } from '../../repositories/mealRepository';
import { listFoods } from '../../repositories/foodRepository';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { firstError, requiredText } from '../../utils/validation';
import {
  createDraftMealFood,
  DraftMealFood,
  factorFor,
  MealEntryGroup,
  MealFoodEditor,
  MealFoodRow,
} from './components/MealFoodEditor';

type Errors = Partial<Record<'name' | 'foods', string | null>>;

export function MealFormScreen({ navigation, route }: RootStackScreenProps<'MealForm'>) {
  const mealId = route.params?.mealId;
  const isEditing = typeof mealId === 'number';

  const [name, setName] = useState('');
  const [entries, setEntries] = useState<DraftMealFood[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const keySeed = useRef(0);

  const { data: foods, reload: reloadFoods } = useQuery<Food[]>(() => listFoods(), [], []);
  useRefreshOnFocus(reloadFoods);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      const [meal, existing] = await Promise.all([
        getMeal(mealId),
        listMealFoods(mealId),
      ]);
      if (!active) return;
      if (meal) setName(meal.name);
      setEntries(
        existing.map((item) => ({
          key: `existing-${item.id}`,
          foodId: item.foodId,
          name: item.foodName,
          measurementType: item.measurementType,
          measureQuantity: item.measureQuantity,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          calories: item.calories,
          photoUri: item.photoUri,
          quantity: String(item.quantity),
        })),
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, mealId]);

  useAppEvent(
    'food-selected',
    useCallback(
      ({ foodId }) => {
        const food = foods.find((item) => item.id === foodId);
        if (!food) return;
        const existing = entries.find((entry) => entry.foodId === foodId);
        if (existing) {
          setActiveKey(existing.key);
          return;
        }
        keySeed.current += 1;
        // Default to one full measure, which is the food's own basis.
        const draft = createDraftMealFood(
          food,
          `new-${keySeed.current}`,
          String(food.measureQuantity),
        );
        setEntries((current) => [...current, draft]);
        setActiveKey(draft.key);
      },
      [entries, foods],
    ),
  );

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.key === activeKey) ?? null,
    [entries, activeKey],
  );

  /** Totals recalculate on every quantity or food change. */
  const totals: MacroTotals = useMemo(
    () =>
      sumMacros(
        entries.map((entry) => ({
          factor: factorFor(entry),
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          calories: entry.calories,
        })),
      ),
    [entries],
  );

  const handleSaveEntry = (updated: DraftMealFood) => {
    setEntries((current) => current.map((entry) => (entry.key === updated.key ? updated : entry)));
  };

  const handleRemoveEntry = (draft: DraftMealFood) => {
    setEntries((current) => current.filter((entry) => entry.key !== draft.key));
    setActiveKey(null);
  };

  const handleSave = async () => {
    const nameResult = requiredText(name, 'Meal name');

    let quantityError: string | undefined;
    for (const entry of entries) {
      const value = Number(entry.quantity);
      if (!Number.isFinite(value) || value <= 0) {
        quantityError = `Enter a quantity greater than 0 for ${entry.name}`;
        break;
      }
    }

    const nextErrors: Errors = {
      name: nameResult.error,
      foods: entries.length === 0 ? 'Add at least one food to the meal' : quantityError,
    };
    setErrors(nextErrors);
    setFormError(null);

    const summary = firstError(nextErrors);
    if (summary) {
      setFormError(summary);
      return;
    }

    setSaving(true);
    try {
      const input = {
        name: nameResult.value,
        foods: entries.map((entry) => ({
          foodId: entry.foodId,
          quantity: Number(entry.quantity),
        })),
      };
      if (isEditing) {
        await updateMeal(mealId, input);
      } else {
        await createMeal(input);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The meal could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading meal…" />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {formError ? <FormHint>{formError}</FormHint> : null}

        <Card>
          <TextField
            label="Meal name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Post-workout breakfast"
            error={errors.name}
            maxLength={60}
            autoFocus={!isEditing}
            testID="field-meal-name"
          />
        </Card>

        <MacroTotalsCard totals={totals} title="Running totals" />

        <Section
          title={`Foods${entries.length ? ` (${entries.length})` : ''}`}
          action={
            <Button
              label="Add"
              icon="add"
              variant="ghost"
              onPress={() => navigation.navigate('FoodPicker')}
            />
          }
        >
          {entries.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                {foods.length === 0
                  ? 'Your food database is empty. Add foods first, then come back to build the meal.'
                  : 'Add at least one food to this meal.'}
              </Text>
              <Button
                label={foods.length === 0 ? 'Go to food database' : 'Add food'}
                icon="add"
                variant="secondary"
                onPress={() => navigation.navigate('FoodPicker')}
              />
            </Card>
          ) : (
            <View style={styles.stack}>
              {errors.foods ? <Text style={styles.error}>{errors.foods}</Text> : null}
              <MealEntryGroup>
                {entries.map((entry, index) => (
                  <MealFoodRow
                    key={entry.key}
                    draft={entry}
                    last={index === entries.length - 1}
                    onPress={() => setActiveKey(entry.key)}
                  />
                ))}
              </MealEntryGroup>
            </View>
          )}
        </Section>

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.action}
          />
          <Button
            label={isEditing ? 'Save changes' : 'Create meal'}
            onPress={handleSave}
            loading={saving}
            style={styles.action}
          />
        </View>
      </ScrollableContent>

      <MealFoodEditor
        visible={activeEntry !== null}
        draft={activeEntry}
        onClose={() => setActiveKey(null)}
        onSave={handleSaveEntry}
        onRemove={handleRemoveEntry}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});

