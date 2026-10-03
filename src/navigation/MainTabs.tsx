import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '../components/Icon';
import { DietHubScreen } from '../screens/diet/DietHubScreen';
import { UserScreen } from '../screens/user/UserScreen';
import { WorkoutHubScreen } from '../screens/workout/WorkoutHubScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_META: Record<keyof TabParamList, { label: string; icon: IconName; activeIcon: IconName }> = {
  User: { label: 'User', icon: 'person-outline', activeIcon: 'person' },
  Workout: { label: 'Workout', icon: 'barbell-outline', activeIcon: 'barbell' },
  Diet: { label: 'Diet', icon: 'restaurant-outline', activeIcon: 'restaurant' },
};

function TabIcon({
  name,
  focused,
}: {
  name: { icon: IconName; activeIcon: IconName };
  focused: boolean;
}) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
      <Icon
        name={focused ? name.activeIcon : name.icon}
        size={22}
        color={focused ? colors.text : colors.textTertiary}
      />
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: [
          styles.tabBar,
          { height: 62 + insets.bottom, paddingBottom: insets.bottom + spacing.sm },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={TAB_META[route.name]} focused={focused} />
        ),
        tabBarAccessibilityLabel: TAB_META[route.name].label,
      })}
    >
      <Tab.Screen name="User" component={UserScreen} options={{ tabBarLabel: 'User' }} />
      <Tab.Screen name="Workout" component={WorkoutHubScreen} options={{ tabBarLabel: 'Workout' }} />
      <Tab.Screen name="Diet" component={DietHubScreen} options={{ tabBarLabel: 'Diet' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    paddingTop: spacing.sm,
  },
  tabItem: {
    paddingTop: spacing.xs,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 30,
  },
  indicator: {
    height: 3,
    width: 18,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: colors.silverBright,
  },
});
