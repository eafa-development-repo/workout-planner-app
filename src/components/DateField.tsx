import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatDateKey, isValidDateKey, parseDateKey, toDateKey } from '../utils/date';
import { Icon } from './Icon';

interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`, or null when the date is optional and unset. */
  value: string | null;
  onChange: (value: string | null) => void;
  optional?: boolean;
  error?: string | null;
  helper?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

/** Android date input backed by the native date picker dialog. */
export function DateField({
  label,
  value,
  onChange,
  optional = false,
  error,
  helper,
  style,
  testID,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const isSet = Boolean(value && isValidDateKey(value));
  const displayDate = isSet && value ? parseDateKey(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'dismissed' || !date) return;
    onChange(toDateKey(date));
  };

  const clear = () => onChange(null);

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && isSet ? (
          <Pressable onPress={clear} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Clear ${label}`}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        testID={testID}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${isSet ? formatDateKey(value) : 'Not set'}`}
        style={({ pressed }) => [
          styles.control,
          error ? styles.controlError : null,
          pressed && styles.pressed,
        ]}
      >
        <Icon name="calendar-outline" size={18} color={colors.textTertiary} />
        <Text
          style={[styles.value, isSet ? styles.valueSelected : styles.valuePlaceholder]}
          numberOfLines={1}
        >
          {isSet ? formatDateKey(value) : optional ? 'Not set (optional)' : 'Select a date'}
        </Text>
      </Pressable>

      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}

      {open ? (
        <DateTimePicker
          value={displayDate}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  clear: {
    ...typography.caption,
    color: colors.silverMuted,
    fontWeight: '700',
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
