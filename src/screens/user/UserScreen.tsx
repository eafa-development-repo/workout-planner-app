import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Section } from '../../components/Card';
import { HeaderAction, LoadingState, RowDivider } from '../../components/Button';
import { AppHeader, Screen, ScrollableContent } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { EmptyState } from '../../components/Feedback';
import { WeightChart } from '../../components/WeightChart';
import { useQuery } from '../../hooks/useQuery';
import type { RootStackScreenProps } from '../../navigation/types';
import { listWeightHistory } from '../../repositories/weightRepository';
import { getUser } from '../../repositories/userRepository';
import type { User, WeightRecord } from '../../db/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDateKey, relativeDayLabel } from '../../utils/date';
import { formatDelta, formatWeight, initialsOf, trimNumber } from '../../utils/format';

interface ProfileData {
  user: User | null;
  records: WeightRecord[];
}

export function UserScreen() {
  const navigation = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();

  const { data, loading, error, reload } = useQuery<ProfileData>(
    async () => {
      const user = await getUser();
      const records = user ? await listWeightHistory(user.id) : [];
      return { user, records };
    },
    [],
    { user: null, records: [] },
  );

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (loading && !data.user) {
    return (
      <Screen>
        <AppHeader title="User" />
        <LoadingState label="Loading your profile…" />
      </Screen>
    );
  }

  const { user, records } = data;
  const latest = records[0] ?? null;
  const previous = records[1] ?? null;
  const first = records[records.length - 1] ?? null;

  const deltaLatest = latest && previous ? latest.weight - previous.weight : null;
  const deltaOverall = latest && first && records.length > 1 ? latest.weight - first.weight : null;

  return (
    <Screen>
      <AppHeader
        title="User"
        subtitle={'Your profile and progress'}
        action={
          <HeaderAction
            label="Edit"
            icon="create-outline"
            onPress={() => navigation.navigate('ProfileForm')}
          />
        }
      />

      <ScrollableContent bottomInset={spacing.huge} gap={spacing.xl}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(user?.name ?? 'Athlete')}</Text>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name ?? 'Athlete'}
              </Text>
              <Text style={styles.goal} numberOfLines={2}>
                {user?.goal?.trim() ? user.goal : 'No goal set yet'}
              </Text>
            </View>
          </View>

          <RowDivider />

          <View style={styles.statGrid}>
            <Stat label="Weight" value={user?.currentWeight ? trimNumber(user.currentWeight) : '—'} unit="kg" />
            <Stat label="Height" value={user?.height ? trimNumber(user.height) : '—'} unit="cm" />
            <Stat label="Age" value={user?.age ? String(user.age) : '—'} unit="yrs" />
            <Stat label="Sex" value={user?.sex ?? '—'} />
          </View>
        </Card>

        <Section
          title="Weight history"
          action={
            <HeaderAction
              label="Add"
              icon="add"
              onPress={() => navigation.navigate('WeightForm', {})}
            />
          }
        >
          {records.length === 0 ? (
            <Card>
              <EmptyState
                icon="scale-outline"
                title="No weight records yet"
                message="Log your weight over time to see progress on the chart."
                actionLabel="Add first record"
                onAction={() => navigation.navigate('WeightForm', {})}
              />
            </Card>
          ) : (
            <View style={styles.stack}>
              <Card padded={false}>
                <View style={styles.chartInner}>
                  <View style={styles.chartSummary}>
                    <View>
                      <Text style={styles.chartLabel}>Latest</Text>
                      <Text style={styles.chartValue}>
                        {latest ? formatWeight(latest.weight) : '—'}
                      </Text>
                    </View>
                    <View style={styles.chartStats}>
                      <DeltaPill
                        label="vs previous"
                        value={deltaLatest === null ? null : formatDelta(deltaLatest, 'kg')}
                        tone={deltaLatest === null ? 'neutral' : deltaLatest > 0 ? 'up' : 'down'}
                      />
                      <DeltaPill
                        label="total change"
                        value={deltaOverall === null ? null : formatDelta(deltaOverall, 'kg')}
                        tone={deltaOverall === null ? 'neutral' : deltaOverall > 0 ? 'up' : 'down'}
                      />
                    </View>
                  </View>
                </View>
                <WeightChart records={records} />
              </Card>

              <ListGroup>
                {records.map((record, index) => {
                  // Records are newest first, so the next row is the older one.
                  const older = records[index + 1];
                  return (
                    <ListRow
                      key={record.id}
                      last={index === records.length - 1}
                      title={formatWeight(record.weight)}
                      subtitle={`${relativeDayLabel(record.recordedAt)} · ${formatDateKey(record.recordedAt)}`}
                      meta={older ? formatDelta(record.weight - older.weight, 'kg') : '—'}
                      onPress={() => navigation.navigate('WeightForm', { recordId: record.id })}
                      accessibilityHint="Opens the record editor"
                    />
                  );
                })}
              </ListGroup>

              <Text style={styles.hint}>Tap a record to edit or delete it.</Text>
            </View>
          )}
        </Section>
      </ScrollableContent>
    </Screen>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function DeltaPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null;
  tone: 'neutral' | 'up' | 'down';
}) {
  const color =
    tone === 'up' ? colors.silver : tone === 'down' ? colors.success : colors.textTertiary;
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color }]}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  stack: {
    gap: spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.heading,
    fontSize: 20,
    color: colors.text,
  },
  identityText: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  goal: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    rowGap: spacing.lg,
  },
  stat: {
    width: '50%',
    gap: spacing.xxs,
  },
  statLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.numeric,
    fontSize: 19,
    lineHeight: 25,
    color: colors.text,
  },
  statUnit: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  chartInner: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  chartSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  chartLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  chartValue: {
    ...typography.numeric,
    color: colors.text,
    marginTop: 2,
  },
  chartStats: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  pill: {
    alignItems: 'flex-end',
  },
  pillLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
  pillValue: {
    ...typography.subheading,
    fontSize: 14,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
