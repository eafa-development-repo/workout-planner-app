import { useCallback } from 'react';

import { ItemPickerList, PickerItem } from '../../components/ItemPickerList';
import { Button } from '../../components/Button';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { Screen } from '../../components/Layout';
import type { RootStackScreenProps } from '../../navigation/types';
import { listExercises } from '../../repositories/exerciseRepository';
import type { Exercise } from '../../db/types';
import { emitAppEvent } from '../../utils/events';

export function ExercisePickerScreen({ navigation }: RootStackScreenProps<'ExercisePicker'>) {
  const { data, loading, reload } = useQuery<Exercise[]>(() => listExercises(), [], []);

  useRefreshOnFocus(reload);

  const items: PickerItem[] = data.map((exercise) => ({
    id: exercise.id,
    title: exercise.name,
    subtitle: exercise.muscleGroup,
    photoUri: exercise.photoUri,
  }));

  const handleSelect = useCallback(
    (id: number) => {
      emitAppEvent('exercise-selected', { exerciseId: id });
      navigation.goBack();
    },
    [navigation],
  );

  return (
    <Screen edges={['bottom']}>
      <ItemPickerList
        items={items}
        loading={loading}
        searchPlaceholder="Search exercises"
        emptyTitle="No exercises available"
        emptyMessage="Create an exercise first, then add it to your workout."
        onSelect={handleSelect}
        header={
          <Button
            label="Create new exercise"
            icon="add"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('ExerciseForm', {})}
          />
        }
      />
    </Screen>
  );
}