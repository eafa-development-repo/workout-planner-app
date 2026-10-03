import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/** Re-runs a loader every time the screen regains focus, e.g. after a form closes. */
export function useRefreshOnFocus(reload: () => Promise<void> | void): void {
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
}
