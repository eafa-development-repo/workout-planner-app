import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import type { MacroTotals, MealFoodDetail } from '../db/types';
import { colors, macroColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatMacro } from '../utils/format';

/** Total energy split by macro, shown as a single proportional bar. */
function MacroSplitBar({ totals }: { totals: MacroTotals }) {
  const grams = totals.protein + totals.carbs + totals.fat;
  const shares = grams > 0
    ? [
        { key: 'protein', value: totals.protein, color: macroColors.protein },
        { key: 'carbs', value: totals.carbs, color: macroColors.carbs },
        { key: 'fat', value: totals.fat, color: macroColors.fat },
      ].filter((entry) => entry.value > 0)
    : [];

  if (shares.length === 0) {
    return <View style={[styles.splitBar, styles.splitBarEmpty]} />;
  }

  return (
    <View style={styles.splitBar}>
      {shares.map((share) => (
        <View
          key={share.key}
          style={{
            flex: share.value / grams,
            backgroundColor: share.color,
          }}
        />
      ))}
    </View>
  );
}

interface MacroTotalsCardProps {
  totals: MacroTotals;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

/** Meal-level nutrition summary: calories plus the three macros. */
export function MacroTotalsCard({ totals, title = 'Meal totals', style }: MacroTotalsCardProps) {
  return (
    <View style={[styles.totalsCard, style]}>
      <View style={styles.totalsHeader}>
        <Text style={styles.totalsTitle}>{title}</Text>
        <View style={styles.caloriesBlock}>
          <Text style={styles.caloriesValue}>{formatMacro(totals.calories)}</Text>
          <Text style={styles.caloriesUnit}>kcal</Text>
        </View>
      </View>

      <MacroSplitBar totals={totals} />

      <View style={styles.macroRow}>
        <Macro label="Protein" value={totals.protein} color={macroColors.protein} />
        <Macro label="Carbs" value={totals.carbs} color={macroColors.carbs} />
        <Macro label="Fat" value={totals.fat} color={macroColors.fat} />
      </View>
    </View>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroCell}>
      <View style={styles.macroLabelRow}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>{formatMacro(value)}g</Text>
    </View>
  );
}

/** Compact per-food nutrition numbers for a single meal entry. */
export function MacroInline({ item }: { item: MealFoodDetail }) {
  return (
    <View style={styles.inlineMacros}>
      <Text style={styles.inlineMacroText}>{formatMacro(item.protein * item.factor)}g P</Text>
      <Text style={styles.inlineMacroText}>{formatMacro(item.carbs * item.factor)}g C</Text>
      <Text style={styles.inlineMacroText}>{formatMacro(item.fat * item.factor)}g F</Text>
      <Text style={[styles.inlineMacroText, styles.inlineCalories]}>
        {formatMacro(item.calories * item.factor)} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totalsCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalsTitle: {
    ...typography.label,
    color: colors.textSecondary,
  },
  caloriesBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  caloriesValue: {
    ...typography.numeric,
    color: colors.text,
  },
  caloriesUnit: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  splitBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  splitBarEmpty: {
    backgroundColor: colors.border,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroCell: {
    flex: 1,
    gap: spacing.xs,
  },
  macroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  macroLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
  macroValue: {
    ...typography.subheading,
    color: colors.text,
  },
  inlineMacros: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inlineMacroText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  inlineCalories: {
    color: colors.silver,
    fontWeight: '700',
  },
});
