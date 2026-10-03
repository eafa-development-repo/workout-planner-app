import { useCallback, useEffect, useRef, useState } from 'react';

import { AppEventMap, AppEventType, onAppEvent } from '../utils/events';

export interface QueryState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

interface QuerySnapshot<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader and exposes it as screen state. The loader re-runs
 * whenever `deps` change; a stale run never overwrites a newer result.
 */
export function useQuery<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList,
  initial: T,
): QueryState<T> {
  const [snapshot, setSnapshot] = useState<QuerySnapshot<T>>({
    data: initial,
    loading: true,
    error: null,
  });

  const runIdRef = useRef(0);
  const mountedRef = useRef(true);
  const loaderRef = useRef(loader);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep the latest loader without re-running the query on every render.
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const reload = useCallback(async () => {
    const currentRun = ++runIdRef.current;
    try {
      const result = await loaderRef.current();
      if (!mountedRef.current || currentRun !== runIdRef.current) return;
      setSnapshot({ data: result, loading: false, error: null });
    } catch (caught) {
      if (!mountedRef.current || currentRun !== runIdRef.current) return;
      setSnapshot((current) => ({
        data: current.data,
        loading: false,
        error: caught instanceof Error ? caught.message : 'Something went wrong.',
      }));
    }
  }, []);

  useEffect(() => {
    // `reload` only updates state after the await settles, so this does not
    // trigger a synchronous cascading render.
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data: snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
    reload,
  };
}

/**
 * Receives a one-shot selection event emitted by a picker screen, for as long
 * as the calling screen stays mounted.
 */
export function useAppEvent<T extends AppEventType>(
  type: T,
  handler: (payload: AppEventMap[T]) => void,
): void {
  useEffect(() => onAppEvent(type, handler), [type, handler]);
}
