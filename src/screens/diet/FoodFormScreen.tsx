import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { Button, LoadingState } from '../../components/Button';
import { useConfirm } from '../../components/ConfirmDialog';
import { FormHint, Screen, ScrollableContent } from '../../components/Layout';
import { OptionField } from '../../components/OptionField';
import { PhotoField } from '../../components/PhotoField';
import { TextField } from '../../components/TextField';
import { UnitSuffix } from '../../components/UnitSuffix';
import {
  DEFAULT_MEASURE_QUANTITY,
  MEASUREMENT_LABEL,
  MEASUREMENT_SHORT,
  MEASUREMENT_TYPES,
  type MeasurementType,
} from '../../db/types';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  createFood,
  deleteFood,
  getFood,
  getFoodUsage,
  isFoodNameTaken,
  updateFood,
} from '../../repositories/foodRepository';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCount, pluralize, trimNumber } from '../../utils/format';
import {
  firstError,
  parseNonNegativeDecimal,
  parsePositiveDecimal,
  requiredChoice,
  requiredText,
} from '../../utils/validation';

const MEASUREMENT_CHOICES = MEASUREMENT_TYPES.map((type) => ({
  value: type,
  label: type === 'grams' ? 'Grams' : 'Units',
  description: type === 'grams' ? 'Measured in grams' : 'Measured in whole units',
}));

type Errors = Partial<
  Record<
    | 'name'
    | 'measurementType'
    | 'measureQuantity'
    | 'protein'
    | 'carbs'
    | 'fat'
    | 'calories',
    string | null
  >
>;

export function FoodFormScreen({ navigation, route }: RootStackScreenProps<'FoodForm'>) {
  const foodId = route.params?.foodId;
  const isEditing = typeof foodId === 'number';
  const confirm = useConfirm();

  const [name, setName] = useState('');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('grams');
  const [measureQuantity, setMeasureQuantity] = useState('100');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [calories, setCalories] = useState('');
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
      const food = await getFood(foodId);
      if (!active) return;
      if (food) {
        setName(food.name);
        setMeasurementType(food.measurementType);
        setMeasureQuantity(String(food.measureQuantity));
        setProtein(String(food.protein));
        setCarbs(String(food.carbs));
        setFat(String(food.fat));
        setCalories(String(food.calories));
        setPhotoUri(food.photoUri);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, foodId]);

  const handleMeasurementChange = (value: MeasurementType) => {
    setMeasurementType(value);
    // Reset the basis to the sensible default for the new measurement type,
    // but only when the current value is still untouched.
    const current = Number(measureQuantity);
    if (current === DEFAULT_MEASURE_QUANTITY.grams || current === DEFAULT_MEASURE_QUANTITY.units) {
      setMeasureQuantity(String(DEFAULT_MEASURE_QUANTITY[value]));
    }
  };

  const basis = Number(measureQuantity) || DEFAULT_MEASURE_QUANTITY[measurementType];
  const parsedPer100 = {
    protein: (Number(protein) || 0) * (100 / basis),
    carbs: (Number(carbs) || 0) * (100 / basis),
    fat: (Number(fat) || 0) * (100 / basis),
    calories: (Number(calories) || 0) * (100 / basis),
  };

  const handleSave = async () => {
    const nameResult = requiredText(name, 'Name');
    const typeResult = requiredChoice(measurementType, 'Measurement type');
    const basisResult = parsePositiveDecimal(measureQuantity, 'Measure quantity');
    const proteinResult = parseNonNegativeDecimal(protein, 'Protein');
    const carbsResult = parseNonNegativeDecimal(carbs, 'Carbohydrates');
    const fatResult = parseNonNegativeDecimal(fat, 'Fat');
    const caloriesResult = parseNonNegativeDecimal(calories, 'Calories');

    const nextErrors: Errors = {
      name: nameResult.error,
      measurementType: typeResult.error ?? undefined,
      measureQuantity: basisResult.error ?? undefined,
      protein: proteinResult.error ?? undefined,
      carbs: carbsResult.error ?? undefined,
      fat: fatResult.error ?? undefined,
      calories: caloriesResult.error ?? undefined,
    };

    if (!nameResult.error) {
      const taken = await isFoodNameTaken(nameResult.value, isEditing ? foodId : undefined);
      if (taken) nextErrors.name = 'A food with this name already exists';
    }

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
        measurementType: measurementType ?? 'grams',
        measureQuantity: basisResult.value ?? 100,
        protein: proteinResult.value ?? 0,
        carbs: carbsResult.value ?? 0,
        fat: fatResult.value ?? 0,
        calories: caloriesResult.value ?? 0,
        photoUri,
      };
      if (isEditing) {
        await updateFood(foodId, input);
      } else {
        await createFood(input);
      }
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The food could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setDeleting(true);
    try {
      const usage = await getFoodUsage(foodId);
      const confirmed = await confirm({
        title: 'Delete food?',
        message:
          usage.mealCount > 0
            ? `"${name}" is used in ${formatCount(usage.mealCount, 'meal')} (${usage.mealNames.join(', ')}). Deleting it also removes it from ${pluralize(usage.mealCount, 'meal')}.`
            : 'This food will be permanently removed from your food database.',
        confirmLabel: 'Delete',
        destructive: true,
      });
      if (!confirmed) return;
      await deleteFood(foodId);
      navigation.goBack();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The food could not be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState label="Loading food…" />
      </Screen>
    );
  }

  const unitLabel = MEASUREMENT_LABEL[measurementType];
  const shortUnit = MEASUREMENT_SHORT[measurementType];

  return (
    <Screen edges={['bottom']}>
      <ScrollableContent gap={spacing.xl} bottomInset={spacing.huge}>
        {formError ? <FormHint>{formError}</FormHint> : null}

        <Card style={styles.card}>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Breast"
            error={errors.name}
            maxLength={60}
            autoFocus={!isEditing}
            testID="field-food-name"
          />
          <OptionField
            label="Measurement type"
            value={measurementType}
            options={MEASUREMENT_CHOICES}
            onChange={handleMeasurementChange}
            error={errors.measurementType}
            testID="field-measurement-type"
          />
          <TextField
            label="Nutrition is given per"
            value={measureQuantity}
            onChangeText={setMeasureQuantity}
            keyboardType="decimal-pad"
            error={errors.measureQuantity}
            helper={`All values below describe ${measureQuantity || '0'} ${unitLabel}.`}
            suffix={<UnitSuffix unit={shortUnit} />}
            testID="field-measure-quantity"
          />
        </Card>

        <Section title="Nutrition">
          <Card style={styles.card}>
            <TextField
              label="Protein"
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
              error={errors.protein}
              placeholder="0"
              suffix={<UnitSuffix unit="g" />}
              testID="field-protein"
            />
            <TextField
              label="Carbohydrates"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="decimal-pad"
              error={errors.carbs}
              placeholder="0"
              suffix={<UnitSuffix unit="g" />}
              testID="field-carbs"
            />
            <TextField
              label="Fat"
              value={fat}
              onChangeText={setFat}
              keyboardType="decimal-pad"
              error={errors.fat}
              placeholder="0"
              suffix={<UnitSuffix unit="g" />}
              testID="field-fat"
            />
            <TextField
              label="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="decimal-pad"
              error={errors.calories}
              placeholder="0"
              suffix={<UnitSuffix unit="kcal" />}
              testID="field-calories"
            />
          </Card>

          <View style={styles.basisCard}>
            <Text style={styles.basisLabel}>Scaled to 100 {unitLabel}</Text>
            <View style={styles.basisRow}>
              <Basis label="Protein (g)" value={parsedPer100.protein} />
              <Basis label="Carbs (g)" value={parsedPer100.carbs} />
              <Basis label="Fat (g)" value={parsedPer100.fat} />
              <Basis label="kcal" value={parsedPer100.calories} />
            </View>
          </View>
        </Section>

        <Card>
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
            label={isEditing ? 'Save changes' : 'Add food'}
            onPress={handleSave}
            loading={saving}
            style={styles.action}
          />
        </View>

        {isEditing ? (
          <Button
            label="Delete food"
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

function Basis({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.basisCell}>
      <Text style={styles.basisCellLabel}>{label}</Text>
      <Text style={styles.basisCellValue}>{trimNumber(value, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  basisCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  basisLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  basisRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  basisCell: {
    flex: 1,
    gap: 2,
  },
  basisCellLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
  basisCellValue: {
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
});
