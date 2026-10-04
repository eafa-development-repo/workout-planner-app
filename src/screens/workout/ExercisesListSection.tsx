import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Fab, LoadingState } from '../../components/Button';
import { EmptyState } from '../../components/Feedback';
import { FilterChips } from '../../components/FilterChips';
import { ListScrollView } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listExercises } from '../../repositories/exerciseRepository';
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '../../db/types';
import { spacing } from '../../theme/spacing';

type Filter = MuscleGroup | 'All';

const FILTERS: readonly Filter[] = ['All', ...MUSCLE_GROUPS];

export function ExercisesListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const [filter, setFilter] = useState<Filter>('All');
  const { data, loading, reload } = useQuery<Exercise[]>(() => listExercises(), [], []);

  useRefreshOnFocus(reload);

  const filtered = useMemo(
    () => (filter === 'All' ? data : data.filter((exercise) => exercise.muscleGroup === filter)),
    [data, filter],
  );

  const list = useMemo(() => {
    if (data.length === 0) {
      return (
        <EmptyState
          icon="barbell"
          title="No exercises yet"
          message="Build your exercise library with names, muscle groups and reference photos."
          actionLabel="New exercise"
          onAction={() => nav.navigate('ExerciseForm', {})}
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="filter-outline"
          title={`No ${filter} exercises`}
          message="Change the filter or add a new exercise for this muscle group."
          actionLabel="New exercise"
          onAction={() => nav.navigate('ExerciseForm', {})}
        />
      );
    }
    return (
      <ListGroup>
        {filtered.map((exercise, index) => (
          <ListRow
            key={exercise.id}
            last={index === filtered.length - 1}
            title={exercise.name}
            subtitle={exercise.muscleGroup}
            leading={{ type: 'image', uri: exercise.photoUri }}
            onPress={() => nav.navigate('ExerciseForm', { exerciseId: exercise.id })}
            accessibilityHint="Opens the exercise editor"
          />
        ))}
      </ListGroup>
    );
  }, [data.length, filter, filtered, nav]);

  return (
    <View style={styles.section}>
      <FilterChips
        options={FILTERS}
        value={filter}
        onChange={setFilter}
        style={styles.filterRow}
        accessibilityLabel="Filter exercises by muscle group"
      />

      {loading && data.length === 0 ? (
        <LoadingState label="Loading exercises…" />
      ) : (
        <ListScrollView horizontal={false}>{list}</ListScrollView>
      )}

      <Fab accessibilityLabel="Create exercise" onPress={() => nav.navigate('ExerciseForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
  filterRow: {
    paddingBottom: spacing.md,
  },
});
