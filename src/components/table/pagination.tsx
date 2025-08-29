import { Table } from '@tanstack/table-core';
import {
  IconChevronLeft,
  IconChevronLeftPipe,
  IconChevronRight,
  IconChevronRightPipe,
} from '@tabler/icons-preact';
import { useTranslation } from '@/i18n';

type PaginationProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
};

export const Pagination = ({ table }: PaginationProps) => {
  const { t } = useTranslation();
  const state = table.getState().pagination;

  // With @preact/signals 2.0.1+, this component does not re-render when filtered rows change.
  // While the reason is not clear, we will stick at 2.0.0 for now.

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <span>{t('Rows per page:')}</span>
      <select
        value={state.pageSize}
        onChange={(e) => {
          table.setPageSize(Number((e.target as HTMLInputElement).value));
        }}
        className="select select-sm select-bordered"
      >
        {[10, 20, 50, 100].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
      <span class="flex-grow" />
      <span>
        {t('A - B of N items', {
          from: state.pageSize * state.pageIndex + 1,
          to: Math.min(
            state.pageSize * (state.pageIndex + 1),
            table.getFilteredRowModel().rows.length,
          ),
          total: table.getFilteredRowModel().rows.length,
        })}
      </span>
      {/* Jump to specific page. */}
      <input
        defaultValue={(state.pageIndex + 1).toString()}
        type="number"
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).value;
          table.setPageIndex(value ? Number(value) - 1 : 0);
        }}
        className="input input-bordered w-20 input-sm text-center"
      />
      {/* Navigation buttons. */}
      <div class="join">
        <button
          className="join-item btn btn-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <IconChevronLeftPipe size={20} />
        </button>
        <button
          className="join-item btn btn-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <IconChevronLeft size={20} />
        </button>
        <button
          className="join-item btn btn-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <IconChevronRight size={20} />
        </button>
        <button
          className="join-item btn btn-sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <IconChevronRightPipe size={20} />
        </button>
      </div>
    </div>
  );
};
