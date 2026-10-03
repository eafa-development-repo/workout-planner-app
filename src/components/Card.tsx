import { ReactNode, memo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface CardProps {
  children: ReactNode;
  /** Adds press feedback. Use with an `onPress` handler. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

function CardBase({
  children,
  onPress,
  style,
  padded = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  const content = (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );

  if (!onPress) {
    return (
      <View accessible={false} testID={testID} style={styles.wrapper}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
      android_ripple={{ color: colors.accentSoft, borderless: false }}
    >
      {content}
    </Pressable>
  );
}

export const Card = memo(CardBase);

/** Small uppercase section label used above groups of content. */
export function SectionLabel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.sectionLabelRow, style]}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

/** Titled card section with a header row and optional trailing action. */
export function Section({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    flexShrink: 1,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
