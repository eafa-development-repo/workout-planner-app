import { useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { Button, HeaderAction, LoadingState } from '../../components/Button';
import { useConfirm } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/Feedback';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { MacroInline, MacroTotalsCard } from '../../components/MacroSummary';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { deleteMeal, getMeal, listMealFoods, sumMacros } from '../../repositories/mealRepository';
import { MEASUREMENT_SHORT, type Meal, type MealFoodDetail } from '../../db/types';
import type { RootStackScreenProps } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCount, formatQuantity } from '../../utils/format';

interface MealDetailData {
  meal: Meal | null;
  foods: MealFoodDetail[];
}

export function MealDetailScreen({ navigation, route }: RootStackScreenProps<'MealDetail'>) {
  const { mealId } = route.params;
  const confirm = useConfirm();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, reload } = useQuery<MealDetailData>(
    async () => {
      const [meal, foods] = await Promise.all([getMeal(mealId), listMealFoods(mealId)]);
      return { meal, foods };
    },
    [mealId],
    { meal: null, foods: [] },
  );

  useRefreshOnFocus(reload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: data.meal?.name ?? 'Meal',
      headerRight: () => (
        <HeaderAction
          label="Edit"
          icon="create-outline"
          onPress={() => navigation.navigate('MealForm', { mealId })}
        />
      ),
    });
  }, [navigation, data.meal, mealId]);

  const totals = useMemo(() => sumMacros(data.foods), [data.foods]);

  const handleDelete = async () => {
    const name = data.meal?.name ?? 'This meal';
    const confirmed = await confirm({
      title: 'Delete meal?',
      message: `"${name}" and its ${formatCount(data.foods.length, 'food')} will be permanently removed. Your food database is not affected.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteMeal(mealId);
      navigation.goBack();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The meal could not be deleted.');
    }
  };

  if (loading && !data.meal) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading meal…" />
      </Screen>
    );
  }

  if (!data.meal) {
    return (
      <Screen edges={['bottom']}>
        <ScrollableContent>
          <EmptyState
            icon="alert-circle-outline"
            title="Meal not found"
            message="This meal was deleted or no longer exists."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </ScrollableContent>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {actionError ? <FormHint>{actionError}</FormHint> : null}

        <MacroTotalsCard totals={totals} title="Meal totals" />

        <Section title={`Foods (${data.foods.length})`}>
          {data.foods.length === 0 ? (
            <Card>
              <EmptyState
                icon="restaurant"
                title="No foods"
                message="Add at least one food to this meal."
                actionLabel="Edit meal"
                onAction={() => navigation.navigate('MealForm', { mealId })}
              />
            </Card>
          ) : (
            <View style={styles.list}>
              {data.foods.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.foodRow, index < data.foods.length - 1 && styles.foodRowBorder]}
                >
                  <View style={styles.foodHeader}>
                    <View style={styles.foodText}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {item.foodName}
                      </Text>
                      <Text style={styles.foodMeta}>
                        {formatQuantity(item.quantity, MEASUREMENT_SHORT[item.measurementType])}
                        {Math.abs(item.factor - 1) > 0.001
                          ? ` · ${item.factor.toFixed(2).replace(/\.?0+$/, '')}× a full measure`
                          : ''}
                      </Text>
                    </View>
                    <Text style={styles.foodCalories}>
                      {item.calories * item.factor > 0
                        ? `${Math.round(item.calories * item.factor)} kcal`
                        : '—'}
                    </Text>
                  </View>
                  <MacroInline item={item} />
                </View>
              ))}
            </View>
          )}
        </Section>

        <View style={styles.actions}>
          <Button
            label="Edit meal"
            icon="create-outline"
            onPress={() => navigation.navigate('MealForm', { mealId })}
            style={styles.action}
          />
          <Button
            label="Delete"
            variant="danger"
            icon="trash-outline"
            onPress={handleDelete}
            style={styles.action}
          />
        </View>

        <Text style={styles.footnote}>
          Nutrition is scaled from each food&apos;s own measurement basis. Everything stays on
          this device.
        </Text>
      </ScrollableContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  foodRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  foodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  foodText: {
    flex: 1,
    gap: 2,
  },
  foodName: {
    ...typography.subheading,
    color: colors.text,
  },
  foodMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  foodCalories: {
    ...typography.subheading,
    fontSize: 14,
    color: colors.silver,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
  footnote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
