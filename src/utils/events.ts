/**
 * Minimal typed event bus used to return a selection from a picker screen
 * without passing non-serializable callbacks through navigation params.
 */

export type AppEventMap = {
  'exercise-selected': { exerciseId: number };
  'food-selected': { foodId: number };
};

export type AppEventType = keyof AppEventMap;

type Handler<T extends AppEventType> = (payload: AppEventMap[T]) => void;

const listeners = new Map<AppEventType, Set<(payload: never) => void>>();

export function emitAppEvent<T extends AppEventType>(type: T, payload: AppEventMap[T]): void {
  const set = listeners.get(type);
  if (!set) return;
  for (const handler of set) {
    (handler as Handler<T>)(payload);
  }
}

export function onAppEvent<T extends AppEventType>(
  type: T,
  handler: Handler<T>,
): () => void {
  let set = listeners.get(type);
  if (!set) {
    set = new Set();
    listeners.set(type, set);
  }
  const entry = handler as (payload: never) => void;
  set.add(entry);
  return () => {
    set?.delete(entry);
  };
}
