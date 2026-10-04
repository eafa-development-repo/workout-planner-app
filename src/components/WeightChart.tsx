import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { WeightRecord } from '../db/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatShortDateKey, parseDateKey } from '../utils/date';
import { trimNumber } from '../utils/format';

interface WeightChartProps {
  /** Records in any order; the chart sorts them chronologically. */
  records: WeightRecord[];
  height?: number;
}

/** Width reserved for the value labels on the left of the plot. */
const AXIS_WIDTH = 28;
/** Left inset of the footer, so its labels line up with the plot area. */
const PLOT_INSET = AXIS_WIDTH + spacing.sm;

/**
 * Dependency-free column chart of the weight history. It stretches to the full
 * width of its container, with only a slim value gutter on the left. Bars are
 * scaled between the record minimum and maximum, so small changes stay visible.
 */
export function WeightChart({ records, height = 168 }: WeightChartProps) {
  const points = useMemo(
    () =>
      [...records]
        .sort((a, b) => parseDateKey(a.recordedAt).getTime() - parseDateKey(b.recordedAt).getTime())
        .map((record) => ({ key: record.recordedAt, value: record.weight })),
    [records],
  );

  const { min, max } = useMemo(() => {
    const values = points.map((point) => point.value);
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  }, [points]);

  const range = max - min;
  const toRatio = (value: number) => (range === 0 ? 0.5 : (value - min) / range);
  const mid = min + range / 2;

  if (points.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.plotRow, { height }]}>
        <View style={styles.axis}>
          <Text style={styles.axisLabel}>{trimNumber(max)}</Text>
          <Text style={styles.axisLabel}>{trimNumber(mid)}</Text>
          <Text style={styles.axisLabel}>{trimNumber(min)}</Text>
        </View>

        <View style={styles.plot}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: '50%' }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />

          <View style={styles.bars}>
            {points.map((point, index) => {
              const isLatest = index === points.length - 1;
              const ratio = toRatio(point.value);
              return (
                <View key={`${point.key}-${index}`} style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      {
                        // Floor keeps every bar visible even for tiny variations.
                        height: `${Math.max(ratio * 100, range === 0 ? 50 : 6)}%`,
                      },
                      isLatest && styles.barLatest,
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{formatShortDateKey(points[0].key)}</Text>
        <Text style={styles.footerLabel}>
          {points.length === 1 ? '1 record' : `${points.length} records`}
        </Text>
        <Text style={styles.footerLabel}>{formatShortDateKey(points[points.length - 1].key)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: spacing.lg,
  },
  plotRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  axis: {
    width: AXIS_WIDTH,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  axisLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
    lineHeight: 12,
  },
  plot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    minWidth: 6,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    backgroundColor: colors.borderStrong,
  },
  barLatest: {
    backgroundColor: colors.silverBright,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingLeft: PLOT_INSET,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footerLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
