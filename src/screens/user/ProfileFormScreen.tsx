import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, LoadingState } from '../../components/Button';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { OptionField } from '../../components/OptionField';
import { TextField } from '../../components/TextField';
import { UnitSuffix } from '../../components/UnitSuffix';
import { Card } from '../../components/Card';
import type { RootStackScreenProps } from '../../navigation/types';
import { getUser, saveUser } from '../../repositories/userRepository';
import { SEX_OPTIONS, type Sex } from '../../db/types';
import { spacing } from '../../theme/spacing';
import {
  firstError,
  optionalText,
  parseNonNegativeDecimal,
  parseNonNegativeInteger,
  requiredText,
} from '../../utils/validation';

const SEX_CHOICES = SEX_OPTIONS.map((option) => ({ value: option, label: option }));

type Errors = Partial<Record<'name' | 'sex' | 'goal' | 'currentWeight' | 'height' | 'age', string | null>>;

export function ProfileFormScreen({ navigation }: RootStackScreenProps<'ProfileForm'>) {
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [goal, setGoal] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await getUser();
      if (!active) return;
      if (user) {
        setName(user.name);
        setSex(user.sex);
        setGoal(user.goal ?? '');
        setCurrentWeight(user.currentWeight !== null ? String(user.currentWeight) : '');
        setHeight(user.height !== null ? String(user.height) : '');
        setAge(user.age !== null ? String(user.age) : '');
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    const nameResult = requiredText(name, 'Name');
    const goalResult = optionalText(goal, 'Goal', 160);
    const weightResult = parseNonNegativeDecimal(currentWeight, 'Current weight');
    const heightResult = parseNonNegativeDecimal(height, 'Height');
    const ageResult = parseNonNegativeInteger(age, 'Age');

    const nextErrors: Errors = {
      name: nameResult.error,
      goal: goalResult.error ?? undefined,
      currentWeight: weightResult.error ?? undefined,
      height: heightResult.error ?? undefined,
      age: ageResult.error ?? undefined,
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
      await saveUser({
        name: nameResult.value,
        sex,
        goal: goalResult.value,
        currentWeight: weightResult.value,
        height: heightResult.value,
        age: ageResult.value,
      });
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading profile…" />
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
            placeholder="Your full name"
            error={errors.name}
            maxLength={60}
            testID="field-name"
          />
          <OptionField
            label="Sex"
            value={sex}
            options={SEX_CHOICES}
            onChange={setSex}
            helper="Optional"
            testID="field-sex"
          />
          <TextField
            label="Goal"
            value={goal}
            onChangeText={setGoal}
            placeholder="e.g. Build muscle and lose fat"
            error={errors.goal}
            maxLength={160}
            multiline
            testID="field-goal"
          />
        </Card>

        <Card style={styles.card}>
          <TextField
            label="Current weight"
            value={currentWeight}
            onChangeText={setCurrentWeight}
            placeholder="0"
            keyboardType="decimal-pad"
            error={errors.currentWeight}
            suffix={<UnitSuffix unit="kg" />}
          />
          <TextField
            label="Height"
            value={height}
            onChangeText={setHeight}
            placeholder="0"
            keyboardType="decimal-pad"
            error={errors.height}
            suffix={<UnitSuffix unit="cm" />}
          />
          <TextField
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="0"
            keyboardType="number-pad"
            error={errors.age}
            suffix={<UnitSuffix unit="yrs" />}
          />
        </Card>

        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.action} />
          <Button label="Save changes" onPress={handleSave} loading={saving} style={styles.action} />
        </View>
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
