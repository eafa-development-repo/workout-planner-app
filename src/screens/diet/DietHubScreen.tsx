import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, Screen } from '../../components/Layout';
import { SegmentedTabs } from '../../components/OptionField';
import { spacing } from '../../theme/spacing';
import { FoodsListSection } from './FoodsListSection';
import { MealsListSection } from './MealsListSection';

type SubTab = 'meals' | 'foods';

const SUB_TABS: { value: SubTab; label: string; icon: 'restaurant' | 'nutrition-outline' }[] = [
  { value: 'meals', label: 'Meals', icon: 'restaurant' },
  { value: 'foods', label: 'Foods', icon: 'nutrition-outline' },
];

/** Diet tab: a subtab switch between saved meals and the food database. */
export function DietHubScreen() {
  const [tab, setTab] = useState<SubTab>('meals');

  return (
    <Screen>
      <AppHeader
        title="Diet"
        subtitle={tab === 'meals' ? 'Your meals and macros' : 'Your food database'}
      />
      <View style={styles.tabsWrapper}>
        <SegmentedTabs value={tab} options={SUB_TABS} onChange={setTab} style={styles.tabs} />
      </View>
      <View style={styles.content}>
        {tab === 'meals' ? <MealsListSection /> : <FoodsListSection />}
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
