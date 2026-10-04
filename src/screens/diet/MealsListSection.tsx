import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Fab, LoadingState } from '../../components/Button';
import { EmptyState } from '../../components/Feedback';
import { ListScrollView } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { MacroTotalsCard } from '../../components/MacroSummary';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listMeals, sumMealTotals } from '../../repositories/mealRepository';
import type { Meal, MacroTotals } from '../../db/types';
import { spacing } from '../../theme/spacing';
import { formatMacro } from '../../utils/format';

function describeMacros(totals: MacroTotals): string {
  return `P ${formatMacro(totals.protein)}g · C ${formatMacro(totals.carbs)}g · F ${formatMacro(totals.fat)}g`;
}

export function MealsListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const { data, loading, reload } = useQuery<Meal[]>(() => listMeals(), [], []);

  useRefreshOnFocus(reload);

  const dietTotals = useMemo(() => sumMealTotals(data), [data]);

  const list = useMemo(() => {
    if (data.length === 0) {
      return (
        <EmptyState
          icon="restaurant"
          title="No meals yet"
          message="Create a meal from your food database and see its macros calculated instantly."
          actionLabel="New meal"
          onAction={() => nav.navigate('MealForm', {})}
        />
      );
    }
    return (
      <ListGroup>
        {data.map((meal, index) => (
          <ListRow
            key={meal.id}
            last={index === data.length - 1}
            title={meal.name}
            subtitle={describeMacros(meal.totals)}
            leading={{ type: 'icon', icon: 'restaurant' }}
            meta={`${formatMacro(meal.totals.calories)} kcal`}
            onPress={() => nav.navigate('MealDetail', { mealId: meal.id })}
            accessibilityHint="Opens the meal with its nutrition breakdown"
          />
        ))}
      </ListGroup>
    );
  }, [data, nav]);

  return (
    <View style={styles.section}>
      <View style={styles.summary}>
        <MacroTotalsCard totals={dietTotals} title="Diet totals" />
      </View>

      {loading && data.length === 0 ? (
        <LoadingState label="Loading meals…" />
      ) : (
        <ListScrollView horizontal={false}>{list}</ListScrollView>
      )}
      <Fab accessibilityLabel="Create meal" onPress={() => nav.navigate('MealForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
  summary: {
    paddingBottom: spacing.lg,
  },
});
