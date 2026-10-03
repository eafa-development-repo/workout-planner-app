import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon, IconName } from './Icon';

interface ListRowProps {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  leading?: { type: 'icon'; icon: IconName; tone?: 'default' | 'muted' | 'danger' } | { type: 'image'; uri: string | null } | null;
  trailing?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Removes the bottom border, for the last row in a group. */
  last?: boolean;
}

const leadingTone = {
  default: { bg: colors.surfaceHighest, fg: colors.silver },
  muted: { bg: colors.surfaceElevated, fg: colors.textTertiary },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

/** Standard tappable list row used by every list screen. */
export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  onPress,
  onLongPress,
  accessibilityHint,
  style,
  testID,
  last = false,
}: ListRowProps) {
  const Wrapper = onPress || onLongPress ? Pressable : View;

  return (
    <Wrapper
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }: { pressed: boolean }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leading?.type === 'icon' ? (
        <View
          style={[
            styles.iconLeading,
            { backgroundColor: leadingTone[leading.tone ?? 'default'].bg },
          ]}
        >
          <Icon
            name={leading.icon}
            size={18}
            color={leadingTone[leading.tone ?? 'default'].fg}
          />
        </View>
      ) : leading?.type === 'image' ? (
        <View style={styles.imageLeading}>
          {leading.uri ? (
            <Image
              source={{ uri: leading.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={styles.imageLeadingEmpty}>
              <Icon name="barbell" size={16} color={colors.textTertiary} />
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {meta ? (
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}

      {trailing !== undefined ? (
        <View style={styles.trailing}>{trailing}</View>
      ) : onPress ? (
        <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </Wrapper>
  );
}

/** Vertical stack of rows inside a single bordered card. */
export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.group, style]}>{children}</View>;
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 68,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  iconLeading: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLeading: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageLeadingEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.subheading,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  meta: {
    ...typography.subheading,
    fontSize: 14,
    color: colors.silverMuted,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
