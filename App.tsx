import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WorkoutPlannerApp from './src/App';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <StatusBar style="light" />
      <WorkoutPlannerApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
