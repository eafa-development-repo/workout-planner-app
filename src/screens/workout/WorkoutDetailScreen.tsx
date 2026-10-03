import { useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { Button, HeaderAction, LoadingState } from '../../components/Button';
import { useConfirm } from '../../components/ConfirmDialog';
import { EmptyState, StatTile } from '../../components/Feedback';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { deleteWorkout, getWorkout, listWorkoutExercises } from '../../repositories/workoutRepository';
import type { Workout, WorkoutExerciseDetail } from '../../db/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDateKey, formatDuration } from '../../utils/date';
import { formatCount, formatWeight } from '../../utils/format';
import { EntryGroup, WorkoutExerciseSummary } from './components/WorkoutExerciseEditor';

interface WorkoutDetailData {
  workout: Workout | null;
  entries: WorkoutExerciseDetail[];
}

export function WorkoutDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'WorkoutDetail'>) {
  const { workoutId } = route.params;
  const confirm = useConfirm();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, reload } = useQuery<WorkoutDetailData>(
    async () => {
      const [workout, entries] = await Promise.all([
        getWorkout(workoutId),
        listWorkoutExercises(workoutId),
      ]);
      return { workout, entries };
    },
    [workoutId],
    { workout: null, entries: [] },
  );

  useRefreshOnFocus(reload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: data.workout?.name ?? 'Workout',
      headerRight: () => (
        <HeaderAction
          label="Edit"
          icon="create-outline"
          onPress={() => navigation.navigate('WorkoutForm', { workoutId })}
        />
      ),
    });
  }, [navigation, data.workout, workoutId]);

  const totals = useMemo(() => {
    const sets = data.entries.reduce((sum, item) => sum + item.sets, 0);
    const reps = data.entries.reduce((sum, item) => sum + item.sets * item.reps, 0);
    const volume = data.entries.reduce(
      (sum, item) => sum + (item.weight === null ? 0 : item.sets * item.reps * item.weight),
      0,
    );
    const hasVolume = data.entries.some((item) => item.weight !== null);
    return { sets, reps, volume: hasVolume ? volume : null };
  }, [data.entries]);

  const handleDelete = async () => {
    const name = data.workout?.name ?? 'This workout';
    const confirmed = await confirm({
      title: 'Delete workout?',
      message: `"${name}" and its ${formatCount(data.entries.length, 'exercise')} will be permanently removed. Your exercise library is not affected.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteWorkout(workoutId);
      navigation.goBack();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The workout could not be deleted.');
    }
  };

  if (loading && !data.workout) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading workout…" />
      </Screen>
    );
  }

  if (!data.workout) {
    return (
      <Screen edges={['bottom']}>
        <ScrollableContent>
          <EmptyState
            icon="alert-circle-outline"
            title="Workout not found"
            message="This workout was deleted or no longer exists."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </ScrollableContent>
      </Screen>
    );
  }

  const { workout, entries } = data;
  const duration = formatDuration(workout.startDate, workout.endDate);

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {actionError ? <FormHint>{actionError}</FormHint> : null}

        <Card style={styles.headerCard}>
          <Text style={styles.name}>{workout.name}</Text>
          <Text style={styles.dates}>
            {workout.startDate
              ? `${formatDateKey(workout.startDate)}${
                  workout.endDate && workout.endDate !== workout.startDate
                    ? ` – ${formatDateKey(workout.endDate)}`
                    : ''
                }`
              : 'No dates set'}
            {duration ? ` · ${duration}` : ''}
          </Text>

          <View style={styles.tiles}>
            <StatTile
              label="Exercises"
              value={String(entries.length)}
              caption={entries.length === 1 ? 'movement' : 'movements'}
            />
            <StatTile label="Total sets" value={String(totals.sets)} />
            <StatTile label="Total reps" value={String(totals.reps)} />
          </View>
          {totals.volume !== null ? (
            <View style={styles.volumeRow}>
              <Text style={styles.volumeLabel}>Total volume</Text>
              <Text style={styles.volumeValue}>{formatWeight(totals.volume)}</Text>
            </View>
          ) : null}
        </Card>

        <Section title="Exercises">
          {entries.length === 0 ? (
            <Card>
              <EmptyState
                icon="barbell"
                title="No exercises"
                message="Add at least one exercise to this workout."
                actionLabel="Edit workout"
                onAction={() => navigation.navigate('WorkoutForm', { workoutId })}
              />
            </Card>
          ) : (
            <EntryGroup>
              {entries.map((entry, index) => (
                <WorkoutExerciseSummary
                  key={entry.id}
                  item={entry}
                  last={index === entries.length - 1}
                />
              ))}
            </EntryGroup>
          )}
        </Section>

        <View style={styles.actions}>
          <Button
            label="Edit workout"
            icon="create-outline"
            onPress={() => navigation.navigate('WorkoutForm', { workoutId })}
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
          Volume is sets × reps × load. Workouts are stored only on this device.
        </Text>
      </ScrollableContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    gap: spacing.sm,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  dates: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  volumeLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  volumeValue: {
    ...typography.subheading,
    color: colors.text,
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
