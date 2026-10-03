import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon, IconName } from './Icon';
import { OptionItem, OptionPicker } from './Sheet';

interface OptionFieldProps<T extends string> {
  label: string;
  value: T | null;
  options: OptionItem<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  sheetTitle?: string;
  sheetSubtitle?: string;
}

/** Read-only field that opens a single choice sheet. */
export function OptionField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  helper,
  style,
  testID,
  sheetTitle,
  sheetSubtitle,
}: OptionFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        testID={testID}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${selected ? selected.label : 'Not selected'}`}
        style={({ pressed }) => [
          styles.control,
          error ? styles.controlError : null,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[styles.value, selected ? styles.valueSelected : styles.valuePlaceholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textTertiary} />
      </Pressable>
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}

      <OptionPicker
        visible={open}
        title={sheetTitle ?? label}
        subtitle={sheetSubtitle}
        options={options}
        value={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

/** Horizontal segmented control used for the Workout and Diet subtabs. */
export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
  style,
}: {
  value: T;
  options: { value: T; label: string; icon?: IconName }[];
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmented, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active && styles.pressed,
            ]}
          >
            {option.icon ? (
              <Icon
                name={option.icon}
                size={16}
                color={active ? colors.textInverse : colors.textSecondary}
              />
            ) : null}
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  controlError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  pressed: {
    opacity: 0.75,
  },
  value: {
    ...typography.body,
    flex: 1,
  },
  valueSelected: {
    color: colors.text,
  },
  valuePlaceholder: {
    color: colors.textTertiary,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 42,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentLabel: {
    ...typography.subheading,
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: colors.textInverse,
  },
});
