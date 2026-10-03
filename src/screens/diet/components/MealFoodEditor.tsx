import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { useConfirm } from '../../../components/ConfirmDialog';
import { MacroInline } from '../../../components/MacroSummary';
import { Sheet } from '../../../components/Sheet';
import { TextField } from '../../../components/TextField';
import { UnitSuffix } from '../../../components/UnitSuffix';
import { MEASUREMENT_LABEL, MEASUREMENT_SHORT, type Food, type MealFoodDetail } from '../../../db/types';
import { colors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { formatQuantity, trimNumber } from '../../../utils/format';
import { parsePositiveDecimal } from '../../../utils/validation';

/** In-progress meal entry, kept as a string while the form is open. */
export interface DraftMealFood {
  key: string;
  foodId: number;
  name: string;
  measurementType: Food['measurementType'];
  measureQuantity: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photoUri: string | null;
  quantity: string;
}

export function createDraftMealFood(food: Food, key: string, quantity: string): DraftMealFood {
  return {
    key,
    foodId: food.id,
    name: food.name,
    measurementType: food.measurementType,
    measureQuantity: food.measureQuantity,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    calories: food.calories,
    photoUri: food.photoUri,
    quantity,
  };
}

/** Multiplier used to scale a food's per-measure nutrition to the quantity. */
export function factorFor(draft: DraftMealFood): number {
  const quantity = Number(draft.quantity);
  if (!Number.isFinite(quantity) || draft.measureQuantity <= 0) return 0;
  return quantity / draft.measureQuantity;
}

interface QuantityEditorProps {
  visible: boolean;
  draft: DraftMealFood | null;
  onClose: () => void;
  onSave: (updated: DraftMealFood) => void;
  onRemove: (draft: DraftMealFood) => void;
}

/** Sheet that collects the quantity for one food inside a meal. */
export function MealFoodEditor({ visible, draft, onClose, onSave, onRemove }: QuantityEditorProps) {
  const confirm = useConfirm();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (visible && draft && activeKey !== draft.key) {
    setActiveKey(draft.key);
    setQuantity(draft.quantity);
    setError(null);
  }
  if (!visible && activeKey !== null) {
    setActiveKey(null);
  }

  const close = () => {
    setActiveKey(null);
    onClose();
  };

  const handleSave = () => {
    if (!draft) return;
    const result = parsePositiveDecimal(quantity, 'Quantity');
    setError(result.error);
    if (result.error) return;
    onSave({ ...draft, quantity });
    close();
  };

  const handleRemove = async () => {
    if (!draft) return;
    const confirmed = await confirm({
      title: 'Remove from meal?',
      message: `${draft.name} will be removed from this meal.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!confirmed) return;
    onRemove(draft);
    close();
  };

  if (!draft) return null;

  const unitLabel = MEASUREMENT_LABEL[draft.measurementType];
  const shortUnit = MEASUREMENT_SHORT[draft.measurementType];
  const preview: DraftMealFood = {
    ...draft,
    quantity: quantity.trim() === '' ? '0' : quantity,
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={draft.name}
      subtitle={`Values are stored per ${trimNumber(draft.measureQuantity)} ${unitLabel}`}
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
      <View style={styles.quantityForm}>
        <TextField
          label={`Quantity (${unitLabel})`}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          error={error}
          placeholder="0"
          autoFocus
          suffix={<UnitSuffix unit={shortUnit} />}
          testID="entry-quantity"
        />
        <View style={styles.quickRow}>
          {[0.5, 1, 2].map((factor) => (
            <Button
              key={factor}
              label={`${factor} × ${trimNumber(draft.measureQuantity)} ${shortUnit}`}
              variant="ghost"
              onPress={() => {
                const next = trimNumber(draft.measureQuantity * factor, 2);
                setQuantity(next);
                setError(null);
              }}
            />
          ))}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Nutrition for this amount</Text>
          <MacroInline item={buildDetail(preview)} />
        </View>
      </View>
    </Sheet>
  );
}

function buildDetail(draft: DraftMealFood): MealFoodDetail {
  return {
    id: 0,
    mealId: 0,
    foodId: draft.foodId,
    quantity: Number(draft.quantity) || 0,
    position: 0,
    foodName: draft.name,
    measurementType: draft.measurementType,
    measureQuantity: draft.measureQuantity,
    protein: draft.protein,
    carbs: draft.carbs,
    fat: draft.fat,
    calories: draft.calories,
    photoUri: draft.photoUri,
    factor: factorFor(draft),
  };
}

/** Tappable row summarising one food inside a meal. */
export function MealFoodRow({
  draft,
  onPress,
  last,
}: {
  draft: DraftMealFood;
  onPress: () => void;
  last: boolean;
}) {
  const detail = buildDetail(draft);
  const unit = MEASUREMENT_SHORT[draft.measurementType];

  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowMain}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {draft.name}
          </Text>
          <Text style={styles.rowMeta}>
            {formatQuantity(Number(draft.quantity) || 0, unit)}
            {Math.abs(detail.factor - 1) > 0.001
              ? ` · ${trimNumber(detail.factor, 2)}× a full measure`
              : ''}
          </Text>
        </View>
        <Text style={styles.rowCalories}>{trimNumber(detail.calories * detail.factor)} kcal</Text>
      </View>
      <MacroInline item={detail} />
      <View style={styles.rowActions}>
        <Button label="Edit quantity" variant="ghost" icon="create-outline" onPress={onPress} />
      </View>
    </View>
  );
}

export function MealEntryGroup({ children }: { children: React.ReactNode }) {
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  rowCalories: {
    ...typography.subheading,
    fontSize: 14,
    color: colors.silver,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quantityForm: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTitle: {
    ...typography.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerAction: {
    flex: 1,
  },
});
