import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fab, LoadingState } from '../../components/Button';
import { EmptyState } from '../../components/Feedback';
import { ListScrollView } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listFoods } from '../../repositories/foodRepository';
import { MEASUREMENT_SHORT, MEASUREMENT_TYPES, type Food, type MeasurementType } from '../../db/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatMacro, trimNumber } from '../../utils/format';

type Filter = MeasurementType | 'All';

const FILTERS: Filter[] = ['All', ...MEASUREMENT_TYPES];

export function FoodsListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const [filter, setFilter] = useState<Filter>('All');
  const { data, loading, reload } = useQuery<Food[]>(() => listFoods(), [], []);

  useRefreshOnFocus(reload);

  const filtered = useMemo(
    () => (filter === 'All' ? data : data.filter((food) => food.measurementType === filter)),
    [data, filter],
  );

  const list = useMemo(() => {
    if (data.length === 0) {
      return (
        <EmptyState
          icon="nutrition-outline"
          title="No foods yet"
          message="Build your food database with nutrition per 100 g or per unit."
          actionLabel="New food"
          onAction={() => nav.navigate('FoodForm', {})}
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="filter-outline"
          title="No matching foods"
          message="Change the filter or add a new food."
          actionLabel="New food"
          onAction={() => nav.navigate('FoodForm', {})}
        />
      );
    }
    return (
      <ListGroup>
        {filtered.map((food, index) => (
          <ListRow
            key={food.id}
            last={index === filtered.length - 1}
            title={food.name}
            subtitle={`per ${trimNumber(food.measureQuantity)} ${MEASUREMENT_SHORT[food.measurementType]} · P ${formatMacro(food.protein)}g · C ${formatMacro(food.carbs)}g · F ${formatMacro(food.fat)}g`}
            leading={{ type: 'image', uri: food.photoUri }}
            meta={`${formatMacro(food.calories)} kcal`}
            onPress={() => nav.navigate('FoodForm', { foodId: food.id })}
            accessibilityHint="Opens the food editor"
          />
        ))}
      </ListGroup>
    );
  }, [data.length, filtered, nav]);

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((option) => {
          const active = option === filter;
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {option === 'All' ? 'All' : option === 'grams' ? 'Grams' : 'Units'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && data.length === 0 ? (
        <LoadingState label="Loading foods…" />
      ) : (
        <ListScrollView>{list}</ListScrollView>
      )}

      <Fab accessibilityLabel="Create food" onPress={() => nav.navigate('FoodForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.textInverse,
  },
});
