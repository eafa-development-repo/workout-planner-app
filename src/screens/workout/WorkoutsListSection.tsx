import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Fab, LoadingState } from '../../components/Button';
import { EmptyState } from '../../components/Feedback';
import { ListScrollView } from '../../components/Layout';
import { ListGroup, ListRow } from '../../components/ListRow';
import { useQuery } from '../../hooks/useQuery';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { RootStackScreenProps } from '../../navigation/types';
import { listWorkouts } from '../../repositories/workoutRepository';
import type { Workout } from '../../db/types';
import { formatDateKey, formatDuration } from '../../utils/date';
import { formatCount } from '../../utils/format';

function describeDates(workout: Workout): string {
  if (!workout.startDate) return 'No dates set';
  const end = workout.endDate && workout.endDate !== workout.startDate ? workout.endDate : null;
  return `${formatDateKey(workout.startDate)}${end ? ` – ${formatDateKey(end)}` : ''}`;
}

export function WorkoutsListSection() {
  const nav = useNavigation<RootStackScreenProps<'Tabs'>['navigation']>();
  const { data, loading, reload } = useQuery<Workout[]>(() => listWorkouts(), [], []);

  useRefreshOnFocus(reload);

  const content = useMemo(() => {
    if (data.length === 0) {
      return (
        <EmptyState
          icon="barbell"
          title="No workouts yet"
          message="Create a workout and add the exercises, sets and reps you want to perform."
          actionLabel="New workout"
          onAction={() => nav.navigate('WorkoutForm', {})}
        />
      );
    }
    return (
      <ListGroup>
        {data.map((workout, index) => {
          const duration = formatDuration(workout.startDate, workout.endDate);
          return (
            <ListRow
              key={workout.id}
              last={index === data.length - 1}
              title={workout.name}
              subtitle={duration ? `${describeDates(workout)} · ${duration}` : describeDates(workout)}
              leading={{ type: 'icon', icon: 'barbell' }}
              meta={formatCount(workout.exerciseCount, 'exercise')}
              onPress={() => nav.navigate('WorkoutDetail', { workoutId: workout.id })}
              accessibilityHint="Opens the workout"
            />
          );
        })}
      </ListGroup>
    );
  }, [data, nav]);

  return (
    <View style={styles.section}>
      {loading && data.length === 0 ? (
        <LoadingState label="Loading workouts…" />
      ) : (
        <ListScrollView>{content}</ListScrollView>
      )}
      <Fab accessibilityLabel="Create workout" onPress={() => nav.navigate('WorkoutForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
});
