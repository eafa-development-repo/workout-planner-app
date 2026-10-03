import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, LoadingState } from '../../components/Button';
import { useConfirm } from '../../components/ConfirmDialog';
import { DateField } from '../../components/DateField';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { TextField } from '../../components/TextField';
import { UnitSuffix } from '../../components/UnitSuffix';
import { Card } from '../../components/Card';
import { getUser } from '../../repositories/userRepository';
import {
  createWeightRecord,
  deleteWeightRecord,
  getWeightRecord,
  updateWeightRecord,
} from '../../repositories/weightRepository';
import type { RootStackScreenProps } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { formatDateKey, toDateKey } from '../../utils/date';
import { firstError, parsePositiveDecimal } from '../../utils/validation';

export function WeightFormScreen({ navigation, route }: RootStackScreenProps<'WeightForm'>) {
  const recordId = route.params?.recordId;
  const isEditing = typeof recordId === 'number';
  const confirm = useConfirm();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState<string | null>(toDateKey());
  const [errors, setErrors] = useState<{ weight?: string | null; date?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      const record = await getWeightRecord(recordId);
      if (!active) return;
      if (record) {
        setWeight(String(record.weight));
        setDate(record.recordedAt);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, recordId]);

  const handleSave = async () => {
    const weightResult = parsePositiveDecimal(weight, 'Weight');
    const nextErrors = {
      weight: weightResult.error ?? undefined,
      date: date ? undefined : 'Date is required',
    };
    setErrors(nextErrors);
    setFormError(null);

    const summary = firstError(nextErrors);
    if (summary || weightResult.value === null || !date) {
      setFormError(summary ?? 'Check the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateWeightRecord(recordId, weightResult.value, date);
      } else {
        const user = await getUser();
        if (!user) throw new Error('Create a profile first.');
        await createWeightRecord(user.id, weightResult.value, date);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The record could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    const confirmed = await confirm({
      title: 'Delete weight record?',
      message: `The entry for ${date ? formatDateKey(date) : 'this date'} will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    await deleteWeightRecord(recordId);
    navigation.goBack();
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading record…" />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {formError ? <FormHint>{formError}</FormHint> : null}

        <Card>
          <TextField
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            placeholder="0.0"
            keyboardType="decimal-pad"
            error={errors.weight}
            suffix={<UnitSuffix unit="kg" />}
            autoFocus={!isEditing}
            testID="field-weight"
          />
          <DateField
            label="Date"
            value={date}
            onChange={setDate}
            error={errors.date}
            testID="field-date"
            maximumDate={new Date()}
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
            label={isEditing ? 'Save changes' : 'Add record'}
            onPress={handleSave}
            loading={saving}
            style={styles.action}
          />
        </View>

        {isEditing ? (
          <Button label="Delete record" variant="danger" icon="trash-outline" onPress={handleDelete} />
        ) : null}
      </ScrollableContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});
