import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, Screen } from '../../components/Layout';
import { SegmentedTabs } from '../../components/OptionField';
import { spacing } from '../../theme/spacing';
import { ExercisesListSection } from './ExercisesListSection';
import { WorkoutsListSection } from './WorkoutsListSection';

type SubTab = 'workouts' | 'exercises';

const SUB_TABS: { value: SubTab; label: string; icon: 'barbell' | 'stats-chart' }[] = [
  { value: 'workouts', label: 'Workouts', icon: 'barbell' },
  { value: 'exercises', label: 'Exercises', icon: 'stats-chart' },
];

/** Workout tab: a subtab switch between the workout plans and the exercise library. */
export function WorkoutHubScreen() {
  const [tab, setTab] = useState<SubTab>('workouts');

  return (
    <Screen>
      <AppHeader
        title="Workout"
        subtitle={tab === 'workouts' ? 'Your training sessions' : 'Your exercise library'}
      />
      <View style={styles.tabsWrapper}>
        <SegmentedTabs
          value={tab}
          options={SUB_TABS}
          onChange={setTab}
          style={styles.tabs}
        />
      </View>
      <View style={styles.content}>
        {tab === 'workouts' ? <WorkoutsListSection /> : <ExercisesListSection />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  tabs: {
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
});
