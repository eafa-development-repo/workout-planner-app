import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../../components/Icon';
import { TextField } from '../../../components/TextField';
import { UnitSuffix } from '../../../components/UnitSuffix';
import { Button } from '../../../components/Button';
import { useConfirm } from '../../../components/ConfirmDialog';
import { Sheet } from '../../../components/Sheet';
import type { Exercise, WorkoutExerciseDetail } from '../../../db/types';
import { colors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { formatWeight, trimNumber } from '../../../utils/format';
import {
  firstError,
  optionalText,
  parseOptionalPositiveDecimal,
  parsePositiveInteger,
} from '../../../utils/validation';

/** In-progress workout exercise, kept as strings while the form is open. */
export interface DraftExercise {
  key: string;
  exerciseId: number;
  name: string;
  muscleGroup: string;
  photoUri: string | null;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

export function createDraftExercise(exercise: Exercise, key: string): DraftExercise {
  return {
    key,
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    photoUri: exercise.photoUri,
    sets: '3',
    reps: '10',
    weight: '',
    notes: '',
  };
}

type EntryErrors = Partial<Record<'sets' | 'reps' | 'weight' | 'notes', string>>;

interface EntryEditorProps {
  visible: boolean;
  draft: DraftExercise | null;
  onClose: () => void;
  onSave: (updated: DraftExercise) => void;
  onRemove: (draft: DraftExercise) => void;
}

/** Sheet that collects sets, reps, load and notes for one workout exercise. */
export function WorkoutExerciseEditor({
  visible,
  draft,
  onClose,
  onSave,
  onRemove,
}: EntryEditorProps) {
  const confirm = useConfirm();
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<EntryErrors>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Load the selected entry into local inputs whenever the sheet opens.
  if (visible && draft && activeKey !== draft.key) {
    setActiveKey(draft.key);
    setSets(draft.sets);
    setReps(draft.reps);
    setWeight(draft.weight);
    setNotes(draft.notes);
    setErrors({});
  }
  if (!visible && activeKey !== null) {
    setActiveKey(null);
  }

  const handleClose = () => {
    setActiveKey(null);
    onClose();
  };

  const handleSave = () => {
    if (!draft) return;
    const setsResult = parsePositiveInteger(sets, 'Sets');
    const repsResult = parsePositiveInteger(reps, 'Repetitions');
    const weightResult = parseOptionalPositiveDecimal(weight, 'Load');
    const notesResult = optionalText(notes, 'Notes', 300);

    const nextErrors: EntryErrors = {
      sets: setsResult.error ?? undefined,
      reps: repsResult.error ?? undefined,
      weight: weightResult.error ?? undefined,
      notes: notesResult.error ?? undefined,
    };
    setErrors(nextErrors);
    if (firstError(nextErrors)) return;

    onSave({
      ...draft,
      sets: sets,
      reps: reps,
      weight: weight,
      notes: notes,
    });
    handleClose();
  };

  const handleRemove = async () => {
    if (!draft) return;
    const confirmed = await confirm({
      title: 'Remove exercise?',
      message: `${draft.name} will be removed from this workout. Saved workouts keep all other exercises.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!confirmed) return;
    onRemove(draft);
    handleClose();
  };

  if (!draft) {
    return null;
  }

  return (
    <Sheet
      visible={visible}
      onClose={handleClose}
      title={draft.name}
      subtitle={`${draft.muscleGroup} · sets and reps`}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label="Remove"
            variant="danger"
            icon="trash-outline"
            onPress={handleRemove}
            style={styles.footerAction}
          />
          <Button label="Save" onPress={handleSave} style={styles.footerAction} />
        </View>
      }
    >
      <View style={styles.entryForm}>
        <View style={styles.entryRow}>
          <TextField
            label="Sets"
            value={sets}
            onChangeText={setSets}
            keyboardType="number-pad"
            error={errors.sets}
            style={styles.entryField}
            testID="entry-sets"
          />
          <TextField
            label="Repetitions"
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            error={errors.reps}
            style={styles.entryField}
            testID="entry-reps"
          />
        </View>
        <TextField
          label="Load (optional)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          error={errors.weight}
          placeholder="0"
          suffix={<UnitSuffix unit="kg" />}
          testID="entry-weight"
        />
        <TextField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Tempo, rest, form cues…"
          error={errors.notes}
          maxLength={300}
          multiline
          testID="entry-notes"
        />
      </View>
    </Sheet>
  );
}

/** Tappable summary row for one exercise inside a workout. */
export function WorkoutExerciseRow({
  draft,
  onPress,
  last,
}: {
  draft: DraftExercise;
  onPress: () => void;
  last: boolean;
}) {
  const volume = useMemo(() => {
    const sets = Number(draft.sets);
    const reps = Number(draft.reps);
    const weight = draft.weight.trim() === '' ? null : Number(draft.weight);
    if (!Number.isFinite(sets) || !Number.isFinite(reps)) return null;
    if (weight === null || !Number.isFinite(weight)) return null;
    return sets * reps * weight;
  }, [draft]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${draft.name}, ${draft.sets} sets of ${draft.reps}`}
      accessibilityHint="Edit sets, reps and load"
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.rowPressed]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {draft.name}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {draft.muscleGroup}
          {draft.notes ? ` · ${draft.notes}` : ''}
        </Text>
        <Text style={styles.rowMeta}>
          {draft.sets} × {draft.reps}
          {draft.weight.trim() === '' ? '' : ` · ${formatWeight(Number(draft.weight))}`}
          {volume !== null ? ` · ${trimNumber(volume)} kg volume` : ''}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

/** Read-only variant used on the workout detail screen. */
export function WorkoutExerciseSummary({
  item,
  last,
}: {
  item: WorkoutExerciseDetail;
  last: boolean;
}) {
  const volume =
    item.weight !== null ? item.sets * item.reps * item.weight : null;
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.exerciseName}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={2}>
          {item.muscleGroup}
          {item.notes ? ` · ${item.notes}` : ''}
        </Text>
        <Text style={styles.rowMeta}>
          {item.sets} × {item.reps}
          {item.weight !== null ? ` · ${formatWeight(item.weight)}` : ''}
          {volume !== null ? ` · ${trimNumber(volume)} kg volume` : ''}
        </Text>
      </View>
    </View>
  );
}

export function EntryGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 72,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.silverMuted,
    marginTop: 2,
  },
  entryForm: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  entryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  entryField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerAction: {
    flex: 1,
  },
});
