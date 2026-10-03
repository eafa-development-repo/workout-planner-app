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
import { listExercises } from '../../repositories/exerciseRepository';
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '../../db/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Filter = MuscleGroup | 'All';

const FILTERS: Filter[] = ['All', ...MUSCLE_GROUPS];

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
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && data.length === 0 ? (
        <LoadingState label="Loading exercises…" />
      ) : (
        <ListScrollView>{list}</ListScrollView>
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
