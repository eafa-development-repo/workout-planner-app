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
import { listFoods } from '../../repositories/foodRepository';
import { MEASUREMENT_SHORT, type Food } from '../../db/types';
import { formatMacro, trimNumber } from '../../utils/format';

export function FoodsListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const { data, loading, reload } = useQuery<Food[]>(() => listFoods(), [], []);

  useRefreshOnFocus(reload);

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
    return (
      <ListGroup>
        {data.map((food, index) => (
          <ListRow
            key={food.id}
            last={index === data.length - 1}
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
  }, [data, nav]);

  return (
    <View style={styles.section}>
      {loading && data.length === 0 ? (
        <LoadingState label="Loading foods…" />
      ) : (
        <ListScrollView horizontal={false}>{list}</ListScrollView>
      )}

      <Fab accessibilityLabel="Create food" onPress={() => nav.navigate('FoodForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
});
