import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';
import { MIN_TOUCH, radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon, IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && variantStyles[variant].pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      android_ripple={
        variant === 'ghost'
          ? { color: colors.accentSoft, borderless: false }
          : { color: 'rgba(10,10,12,0.16)', borderless: false }
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles[variant].text.color} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Icon
              name={icon}
              size={18}
              color={variantStyles[variant].text.color}
            />
          ) : null}
          <Text style={[styles.label, variantStyles[variant].text]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'surface' | 'danger';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 20,
  color,
  variant = 'ghost',
  style,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconButton,
        iconButtonStyles[variant].container,
        pressed && styles.pressedIcon,
        style,
      ]}
      android_ripple={{ color: colors.accentSoft, borderless: true, radius: 24 }}
      hitSlop={6}
    >
      <Icon
        name={name}
        size={size}
        color={color ?? iconButtonStyles[variant].text.color}
      />
    </Pressable>
  );
}

/** Header action button (text + optional icon) used in screen headers. */
export function HeaderAction({
  label,
  icon,
  onPress,
  tone = 'default',
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  const color = tone === 'danger' ? colors.danger : colors.silver;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressedIcon]}
      android_ripple={{ color: colors.accentSoft, borderless: true, radius: 22 }}
      hitSlop={8}
    >
      {icon ? <Icon name={icon} size={18} color={color} /> : null}
      <Text style={[styles.headerActionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Circular floating action button anchored to the bottom right of a list. */
export function Fab({ icon = 'add', onPress, accessibilityLabel, style }: {
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.fab, pressed && styles.pressedIcon, style]}
      android_ripple={{ color: 'rgba(10,10,12,0.18)', borderless: false }}
    >
      <Icon name={icon} size={26} color={colors.textInverse} />
    </Pressable>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.silver} size="large" />
      <Text style={styles.centeredLabel}>{label}</Text>
    </View>
  );
}

export function RowDivider() {
  return <View style={styles.divider} />;
}

export function Spacer({ size = spacing.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; pressed: ViewStyle; text: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.accent, borderColor: colors.accent },
    pressed: { backgroundColor: colors.silverBright, transform: [{ scale: 0.99 }] },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong },
    pressed: { backgroundColor: colors.surfaceHighest },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: colors.transparent, borderColor: colors.border },
    pressed: { backgroundColor: colors.surfaceElevated },
    text: { color: colors.silver },
  },
  danger: {
    container: { backgroundColor: colors.dangerSoft, borderColor: 'rgba(242,85,90,0.35)' },
    pressed: { backgroundColor: 'rgba(242,85,90,0.2)' },
    text: { color: colors.danger },
  },
};

const iconButtonStyles = {
  ghost: { container: { backgroundColor: colors.transparent } as ViewStyle, text: { color: colors.silver } },
  surface: { container: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border } as ViewStyle, text: { color: colors.text } },
  danger: { container: { backgroundColor: colors.dangerSoft } as ViewStyle, text: { color: colors.danger } },
};

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.button,
  },
  disabled: {
    opacity: 0.45,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedIcon: {
    opacity: 0.6,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  headerActionLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  centeredLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
