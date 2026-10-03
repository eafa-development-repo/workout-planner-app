import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components/Card';
import { Button, LoadingState } from '../../components/Button';
import { useConfirm } from '../../components/ConfirmDialog';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { OptionField } from '../../components/OptionField';
import { PhotoField } from '../../components/PhotoField';
import { TextField } from '../../components/TextField';
import { MUSCLE_GROUPS, type MuscleGroup } from '../../db/types';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  createExercise,
  deleteExercise,
  getExercise,
  getExerciseUsage,
  isExerciseNameTaken,
  updateExercise,
} from '../../repositories/exerciseRepository';
import { spacing } from '../../theme/spacing';
import { formatCount, pluralize } from '../../utils/format';
import { firstError, requiredChoice, requiredText } from '../../utils/validation';

const MUSCLE_CHOICES = MUSCLE_GROUPS.map((group) => ({ value: group, label: group }));

type Errors = Partial<Record<'name' | 'muscleGroup', string | null>>;

export function ExerciseFormScreen({ navigation, route }: RootStackScreenProps<'ExerciseForm'>) {
  const exerciseId = route.params?.exerciseId;
  const isEditing = typeof exerciseId === 'number';
  const confirm = useConfirm();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      const exercise = await getExercise(exerciseId);
      if (!active) return;
      if (exercise) {
        setName(exercise.name);
        setMuscleGroup(exercise.muscleGroup);
        setPhotoUri(exercise.photoUri);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, exerciseId]);

  const handleSave = async () => {
    const nameResult = requiredText(name, 'Name');
    const groupResult = requiredChoice(muscleGroup, 'Muscle group');
    const nextErrors: Errors = {
      name: nameResult.error,
      muscleGroup: groupResult.error ?? undefined,
    };

    if (!nameResult.error) {
      const taken = await isExerciseNameTaken(nameResult.value, isEditing ? exerciseId : undefined);
      if (taken) nextErrors.name = 'An exercise with this name already exists';
    }

    setErrors(nextErrors);
    setFormError(null);

    const summary = firstError(nextErrors);
    if (summary || groupResult.value === null) {
      setFormError(summary ?? 'Check the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const input = { name: nameResult.value, muscleGroup: groupResult.value, photoUri };
      if (isEditing) {
        await updateExercise(exerciseId, input);
      } else {
        await createExercise(input);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The exercise could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setDeleting(true);
    try {
      const usage = await getExerciseUsage(exerciseId);
      const confirmed = await confirm({
        title: 'Delete exercise?',
        message:
          usage.workoutCount > 0
            ? `"${name}" is used in ${formatCount(usage.workoutCount, 'workout')} (${usage.workoutNames.join(', ')}). Deleting it also removes it from ${pluralize(usage.workoutCount, 'workout', 'workouts')}.`
            : 'This exercise will be permanently removed from your exercise library.',
        confirmLabel: 'Delete',
        destructive: true,
      });
      if (!confirmed) return;
      await deleteExercise(exerciseId);
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The exercise could not be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading exercise…" />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {formError ? <FormHint>{formError}</FormHint> : null}

        <Card style={styles.card}>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Barbell Bench Press"
            error={errors.name}
            maxLength={60}
            autoFocus={!isEditing}
            testID="field-exercise-name"
          />
          <OptionField
            label="Muscle group"
            value={muscleGroup}
            options={MUSCLE_CHOICES}
            onChange={setMuscleGroup}
            error={errors.muscleGroup}
            testID="field-muscle-group"
          />
          <PhotoField
            label="Photo (optional)"
            value={photoUri}
            onChange={setPhotoUri}
            helper="Stored on this device only. Nothing is uploaded."
          />
        </Card>

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.action}
          />
          <Button
            label={isEditing ? 'Save changes' : 'Add exercise'}
            onPress={handleSave}
            loading={saving}
            style={styles.action}
          />
        </View>

        {isEditing ? (
          <Button
            label="Delete exercise"
            variant="danger"
            icon="trash-outline"
            onPress={handleDelete}
            loading={deleting}
          />
        ) : null}
      </ScrollableContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});
