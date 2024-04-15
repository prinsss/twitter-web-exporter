import { liveQuery, Observable } from 'dexie';
import { useEffect, useMemo, useReducer, useRef } from 'preact/hooks';

/**
 * Modified from `dexie-react-hooks` with some lines removed. The modified version
 * is specifically designed for `Observable` and `liveQuery` from Dexie.js.
 *
 * @license Apache-2.0
 * @see https://dexie.org/docs/dexie-react-hooks/useObservable()
 * @see https://github.com/dexie/Dexie.js/blob/v4.0.4/libs/dexie-react-hooks/src/useObservable.ts
 * @param observableFactory Function that returns an observable.
 * @param deps The observableFactory function will be re-executed if deps change.
 * @param defaultResult Result returned on initial render.
 * @returns The current result of the observable.
 */
export function useObservable<T, TDefault>(
  observableFactory: () => Observable<T>,
  deps: unknown[],
  defaultResult: TDefault,
): T | TDefault {
  // Create a ref that keeps the state we need.
  const monitor = useRef({
    hasResult: false,
    result: defaultResult as T | TDefault,
    error: null,
  });

  // We control when component should rerender.
  const [, triggerUpdate] = useReducer((x) => x + 1, 0);

  // Memoize the observable based on deps.
  const observable = useMemo(() => {
    const observable = observableFactory();
    if (!observable || typeof observable.subscribe !== 'function') {
      throw new TypeError(
        `Observable factory given to useObservable() did not return a valid observable.`,
      );
    }

    if (monitor.current.hasResult) {
      return observable;
    }

    if (typeof observable.hasValue !== 'function' || observable.hasValue()) {
      if (typeof observable.getValue === 'function') {
        monitor.current.result = observable.getValue();
        monitor.current.hasResult = true;
      }
    }

    return observable;
  }, deps);

  // Subscribe to the observable.
  useEffect(() => {
    const subscription = observable.subscribe(
      (val) => {
        const state = monitor.current;
        if (state.error !== null || state.result !== val) {
          state.error = null;
          state.result = val;
          state.hasResult = true;
          triggerUpdate(1);
        }
      },
      (err) => {
        if (monitor.current.error !== err) {
          monitor.current.error = err;
          triggerUpdate(1);
        }
      },
    );

    return subscription.unsubscribe.bind(subscription);
  }, deps);

  // Throw if observable has emitted error so that an ErrorBoundary can catch it.
  if (monitor.current.error) {
    throw monitor.current.error;
  }

  // Return the current result.
  return monitor.current.result;
}

/**
 * A hook that subscribes to a live query and returns the current result.
 * Copied from `dexie-react-hooks` with some function overloads removed.
 *
 * @license Apache-2.0
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 * @see https://github.com/dexie/Dexie.js/blob/v4.0.4/libs/dexie-react-hooks/src/useLiveQuery.ts
 * @see https://github.com/dexie/Dexie.js/blob/v4.0.4/src/live-query/live-query.ts
 * @param querier Function that returns a final result (Promise).
 * @param deps Variables that querier is dependent on.
 * @param defaultResult Result returned on initial render.
 * @returns The current result of the live query.
 */
export function useLiveQuery<T, TDefault>(
  querier: () => Promise<T> | T,
  deps?: unknown[],
  defaultResult?: TDefault,
): T | TDefault {
  return useObservable(() => liveQuery(querier), deps || [], defaultResult as TDefault);
}
