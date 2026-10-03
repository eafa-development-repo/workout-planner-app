import { useCallback } from 'react';

import { ItemPickerList, PickerItem } from '../../components/ItemPickerList';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Layout';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listFoods } from '../../repositories/foodRepository';
import type { Food } from '../../db/types';
import { MEASUREMENT_SHORT } from '../../db/types';
import { formatMacro, trimNumber } from '../../utils/format';
import { emitAppEvent } from '../../utils/events';

export function FoodPickerScreen({ navigation }: RootStackScreenProps<'FoodPicker'>) {
  const { data, loading, reload } = useQuery<Food[]>(() => listFoods(), [], []);

  useRefreshOnFocus(reload);

  const items: PickerItem[] = data.map((food) => ({
    id: food.id,
    title: food.name,
    subtitle: `${trimNumber(food.measureQuantity)} ${MEASUREMENT_SHORT[food.measurementType]} · ${formatMacro(food.calories)} kcal · P ${formatMacro(food.protein)}g`,
    photoUri: food.photoUri,
  }));

  const handleSelect = useCallback(
    (id: number) => {
      emitAppEvent('food-selected', { foodId: id });
      navigation.goBack();
    },
    [navigation],
  );

  return (
    <Screen edges={['bottom']}>
      <ItemPickerList
        items={items}
        loading={loading}
        searchPlaceholder="Search foods"
        emptyTitle="No foods available"
        emptyMessage="Create a food first, then add it to a meal."
        onSelect={handleSelect}
        header={
          <Button
            label="Create new food"
            icon="add"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('FoodForm', {})}
          />
        }
      />
    </Screen>
  );
}
