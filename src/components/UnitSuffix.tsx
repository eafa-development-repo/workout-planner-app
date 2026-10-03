import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/** Unit chip rendered inside a text field, e.g. `kg`, `cm`, `g`. */
export function UnitSuffix({ unit }: { unit: string }) {
  return <Text style={styles.unit}>{unit}</Text>;
}

const styles = StyleSheet.create({
  unit: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceHighest,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    overflow: 'hidden',
  },
});
