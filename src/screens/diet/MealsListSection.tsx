import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Fab, LoadingState } from '../../components/Button';
import { EmptyState } from '../../components/Feedback';
import { ListScrollView } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listMeals } from '../../repositories/mealRepository';
import type { Meal } from '../../db/types';
import { formatCount } from '../../utils/format';

export function MealsListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const { data, loading, reload } = useQuery<Meal[]>(() => listMeals(), [], []);

  useRefreshOnFocus(reload);

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
            subtitle={formatCount(meal.foodCount, 'food')}
            leading={{ type: 'icon', icon: 'restaurant' }}
            onPress={() => nav.navigate('MealDetail', { mealId: meal.id })}
            accessibilityHint="Opens the meal with its nutrition breakdown"
          />
        ))}
      </ListGroup>
    );
  }, [data, nav]);

  return (
    <View style={styles.section}>
      {loading && data.length === 0 ? (
        <LoadingState label="Loading meals…" />
      ) : (
        <ListScrollView>{list}</ListScrollView>
      )}
      <Fab accessibilityLabel="Create meal" onPress={() => nav.navigate('MealForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
});
