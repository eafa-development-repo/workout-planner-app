import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { Button, LoadingState } from '../../components/Button';
import { DateField } from '../../components/DateField';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { TextField } from '../../components/TextField';
import { useAppEvent, useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listExercises } from '../../repositories/exerciseRepository';
import { createWorkout, getWorkout, listWorkoutExercises, updateWorkout } from '../../repositories/workoutRepository';
import type { Exercise } from '../../db/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { isValidDateKey, parseDateKey } from '../../utils/date';
import { firstError, requiredText } from '../../utils/validation';
import {
  createDraftExercise,
  DraftExercise,
  EntryGroup,
  WorkoutExerciseEditor,
  WorkoutExerciseRow,
} from './components/WorkoutExerciseEditor';

type Errors = Partial<Record<'name' | 'startDate' | 'endDate' | 'exercises', string | null>>;

export function WorkoutFormScreen({ navigation, route }: RootStackScreenProps<'WorkoutForm'>) {
  const workoutId = route.params?.workoutId;
  const isEditing = typeof workoutId === 'number';

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<DraftExercise[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const keySeed = useRef(0);

  const { data: exercises, reload: reloadExercises } = useQuery<Exercise[]>(
    () => listExercises(),
    [],
    [],
  );
  useRefreshOnFocus(reloadExercises);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      const [workout, existing] = await Promise.all([
        getWorkout(workoutId),
        listWorkoutExercises(workoutId),
      ]);
      if (!active) return;
      if (workout) {
        setName(workout.name);
        setStartDate(workout.startDate);
        setEndDate(workout.endDate);
      }
      setEntries(
        existing.map((item) => ({
          key: `existing-${item.id}`,
          exerciseId: item.exerciseId,
          name: item.exerciseName,
          muscleGroup: item.muscleGroup,
          photoUri: item.photoUri,
          sets: String(item.sets),
          reps: String(item.reps),
          weight: item.weight === null ? '' : String(item.weight),
          notes: item.notes ?? '',
        })),
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, workoutId]);

  // A selection made in the exercise picker arrives here while this screen is
  // still mounted underneath it.
  useAppEvent(
    'exercise-selected',
    useCallback(
      ({ exerciseId }) => {
        const exercise = exercises.find((item) => item.id === exerciseId);
        if (!exercise) return;
        const existing = entries.find((entry) => entry.exerciseId === exerciseId);
        if (existing) {
          setActiveKey(existing.key);
          return;
        }
        keySeed.current += 1;
        const draft = createDraftExercise(exercise, `new-${keySeed.current}`);
        setEntries((current) => [...current, draft]);
        setActiveKey(draft.key);
      },
      [entries, exercises],
    ),
  );

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.key === activeKey) ?? null,
    [entries, activeKey],
  );

  const handleSaveEntry = (updated: DraftExercise) => {
    setEntries((current) => current.map((entry) => (entry.key === updated.key ? updated : entry)));
  };

  const handleRemoveEntry = (draft: DraftExercise) => {
    setEntries((current) => current.filter((entry) => entry.key !== draft.key));
    setActiveKey(null);
  };

  const handleAddExercise = () => {
    navigation.navigate('ExercisePicker');
  };

  const handleSave = async () => {
    const nameResult = requiredText(name, 'Workout name');

    let startError: string | undefined;
    let endError: string | undefined;
    if (startDate && !isValidDateKey(startDate)) startError = 'Start date is invalid';
    if (endDate && !isValidDateKey(endDate)) endError = 'End date is invalid';
    if (!endError && startDate && endDate && parseDateKey(endDate) < parseDateKey(startDate)) {
      endError = 'End date must be on or after the start date';
    }

    const exercisesError =
      entries.length === 0 ? 'Add at least one exercise to the workout' : undefined;

    const nextErrors: Errors = {
      name: nameResult.error,
      startDate: startError,
      endDate: endError,
      exercises: exercisesError,
    };
    setErrors(nextErrors);
    setFormError(null);

    const summary = firstError(nextErrors);
    if (summary) {
      setFormError(summary);
      return;
    }

    setSaving(true);
    try {
      const input = {
        name: nameResult.value,
        startDate,
        endDate,
        exercises: entries.map((entry) => ({
          exerciseId: entry.exerciseId,
          sets: Number(entry.sets),
          reps: Number(entry.reps),
          weight: entry.weight.trim() === '' ? null : Number(entry.weight),
          notes: entry.notes.trim() === '' ? null : entry.notes.trim(),
        })),
      };
      if (isEditing) {
        await updateWorkout(workoutId, input);
      } else {
        await createWorkout(input);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The workout could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading workout…" />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {formError ? <FormHint>{formError}</FormHint> : null}

        <Card style={styles.card}>
          <TextField
            label="Workout name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push Day A"
            error={errors.name}
            maxLength={60}
            autoFocus={!isEditing}
            testID="field-workout-name"
          />
          <View style={styles.dateRow}>
            <DateField
              label="Start date"
              value={startDate}
              onChange={setStartDate}
              optional
              error={errors.startDate}
              style={styles.dateField}
              testID="field-start-date"
            />
            <DateField
              label="End date"
              value={endDate}
              onChange={setEndDate}
              optional
              error={errors.endDate}
              style={styles.dateField}
              testID="field-end-date"
            />
          </View>
        </Card>

        <Section
          title={`Exercises${entries.length ? ` (${entries.length})` : ''}`}
          action={
            <Button
              label="Add"
              icon="add"
              variant="ghost"
              onPress={handleAddExercise}
            />
          }
        >
          {entries.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                {exercises.length === 0
                  ? 'Your exercise library is empty. Add exercises first, then come back to build the workout.'
                  : 'Add at least one exercise to this workout.'}
              </Text>
              <Button
                label={exercises.length === 0 ? 'Go to exercise library' : 'Add exercise'}
                icon="add"
                variant="secondary"
                onPress={handleAddExercise}
              />
            </Card>
          ) : (
            <View style={styles.stack}>
              {errors.exercises ? <Text style={styles.error}>{errors.exercises}</Text> : null}
              <EntryGroup>
                {entries.map((entry, index) => (
                  <WorkoutExerciseRow
                    key={entry.key}
                    draft={entry}
                    last={index === entries.length - 1}
                    onPress={() => setActiveKey(entry.key)}
                  />
                ))}
              </EntryGroup>
            </View>
          )}
        </Section>

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.action}
          />
          <Button
            label={isEditing ? 'Save changes' : 'Create workout'}
            onPress={handleSave}
            loading={saving}
            style={styles.action}
          />
        </View>
      </ScrollableContent>

      <WorkoutExerciseEditor
        visible={activeEntry !== null}
        draft={activeEntry}
        onClose={() => setActiveKey(null)}
        onSave={handleSaveEntry}
        onRemove={handleRemoveEntry}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  stack: {
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});
