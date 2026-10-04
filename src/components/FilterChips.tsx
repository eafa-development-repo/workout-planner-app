import { Pressable, ScrollView, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { HIT_SLOP, radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface FilterChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Overrides the visible text of an option, e.g. `all` -> `All`. */
  labelFor?: (option: T) => string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Compact horizontal row of single choice chips. Kept visually small and dense
 * so long option sets (muscle groups) stay on one line, with a hit slop that
 * restores an accessible touch target.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  labelFor,
  style,
  accessibilityLabel,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      style={styles.scroll}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.row, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const active = option === value;
        const label = labelFor ? labelFor(option) : option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    // RN scroll views grow by default, which would steal height from the list
    // rendered below the chips.
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.textInverse,
  },
});
