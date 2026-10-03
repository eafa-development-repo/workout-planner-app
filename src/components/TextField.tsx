import { ReactNode } from 'react';
import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  /** Rendered inside the field, on the right (e.g. a unit suffix). */
  suffix?: ReactNode;
  prefix?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
  editable?: boolean;
  /** Allows tapping anywhere in the field to trigger a picker. */
  onPress?: () => void;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  keyboardType = 'default',
  multiline = false,
  maxLength,
  autoFocus = false,
  suffix,
  prefix,
  style,
  testID,
  returnKeyType,
  onSubmitEditing,
  editable = true,
  onPress,
}: FieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {maxLength ? (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          hasError && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {prefix ? <View style={styles.affix}>{prefix}</View> : null}
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          autoFocus={autoFocus}
          editable={editable && !onPress}
          onPress={onPress}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor={colors.silverBright}
          cursorColor={colors.silverBright}
          underlineColorAndroid="transparent"
          style={[styles.input, multiline && styles.inputMultiline]}
          accessibilityLabel={label}
        />
        {suffix ? <View style={styles.affix}>{suffix}</View> : null}
      </View>

      {hasError ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
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
  counter: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    minHeight: 108,
  },
  inputContainerError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    margin: 0,
  },
  inputMultiline: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  affix: {
    justifyContent: 'center',
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
