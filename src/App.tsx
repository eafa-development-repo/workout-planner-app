import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { bootstrapDatabase } from './data/bootstrap';
import { ConfirmProvider } from './components/ConfirmDialog';
import { Button } from './components/Button';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from './theme/colors';
import { radius, spacing } from './theme/spacing';
import { typography } from './theme/typography';

type Status = 'loading' | 'ready' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await bootstrapDatabase();
        if (active) setStatus('ready');
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'The local database could not be opened.');
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === 'loading') {
    return (
      <View style={styles.centered} testID="app-loading">
        <ActivityIndicator size="large" color={colors.silver} />
        <Text style={styles.title}>Workout Planner</Text>
        <Text style={styles.subtitle}>Preparing your local database…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered} testID="app-error">
        <View style={styles.badge}>
          <Text style={styles.badgeText}>!</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          {error ?? 'The local database could not be prepared.'}
        </Text>
        <Button
          label="Try again"
          onPress={() => {
            setError(null);
            setStatus('loading');
            setAttempt((value) => value + 1);
          }}
        />
      </View>
    );
  }

  return (
    <ConfirmProvider>
      <RootNavigator />
    </ConfirmProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 300,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.title,
    color: colors.danger,
  },
});
