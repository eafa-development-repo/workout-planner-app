import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={colors.silverMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({ label, value, unit, caption, style }: StatTileProps) {
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.tileValueRow}>
        <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {unit ? <Text style={styles.tileUnit}>{unit}</Text> : null}
      </View>
      {caption ? <Text style={styles.tileCaption}>{caption}</Text> : null}
    </View>
  );
}

interface BadgeProps {
  label: string;
  tone?: 'default' | 'accent' | 'success' | 'danger';
  style?: StyleProp<ViewStyle>;
}

const badgeTones = {
  default: { bg: colors.surfaceElevated, fg: colors.textSecondary, border: colors.border },
  accent: { bg: colors.accentSoft, fg: colors.text, border: colors.borderFocus },
  success: { bg: colors.successSoft, fg: colors.success, border: 'rgba(74,222,128,0.3)' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: 'rgba(242,85,90,0.3)' },
};

export function Badge({ label, tone = 'default', style }: BadgeProps) {
  const palette = badgeTones[tone];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Text style={[styles.badgeLabel, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 180,
  },
  tile: {
    flex: 1,
    minWidth: 96,
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  tileValue: {
    ...typography.numeric,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
  },
  tileUnit: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  tileCaption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
