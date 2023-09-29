import { ComponentType, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { createTable, RowData, TableOptions, TableOptionsResolved } from '@tanstack/table-core';

export type Renderable<TProps> = ComponentType<TProps> | null | undefined | string;

export function flexRender<TProps extends object>(
  Comp: Renderable<TProps>,
  props: TProps,
): JSX.Element | string | null {
  return !Comp ? null : isComponent<TProps>(Comp) ? <Comp {...props} /> : Comp;
}

function isComponent<TProps>(component: unknown): component is ComponentType<TProps> {
  return typeof component === 'function';
}

/**
 * @license MIT
 * https://github.com/TanStack/table/blob/main/packages/react-table/src/index.tsx
 */
export function useReactTable<TData extends RowData>(options: TableOptions<TData>) {
  // Compose in the generic options to the user options
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {}, // Dummy state
    onStateChange: () => {}, // noop
    renderFallbackValue: null,
    ...options,
  };

  // Create a new table and store it in state
  const [tableRef] = useState(() => ({
    current: createTable<TData>(resolvedOptions),
  }));

  // By default, manage table state here using the table's initial state
  const [state, setState] = useState(() => tableRef.current.initialState);

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange?.(updater);
    },
  }));

  return tableRef.current;
}
