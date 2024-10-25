import { JSX } from 'preact';
import { useEffect } from 'preact/hooks';

import { Modal, SearchArea } from '@/components/common';
import { useTranslation } from '@/i18n';
import { useSignalState, useToggle } from '@/utils/common';
import { flexRender, useReactTable } from '@/utils/react-table';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-preact';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowData,
  Table,
} from '@tanstack/table-core';

import { Pagination } from './pagination';
import { ExportDataModal } from '../modals/export-data';

// For opening media preview modal in column definitions.
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    mediaPreview: string;
    setMediaPreview: (url: string) => void;
    rawDataPreview: TData | null;
    setRawDataPreview: (data: TData | null) => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    exportable?: boolean;
    exportKey?: string;
    exportHeader?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportValue?: (row: Row<TData>) => any;
  }
}

type BaseTableViewProps<T> = {
  title: string;
  records: T[];
  columns: ColumnDef<T>[];
  clear: () => void;
  renderActions?: (table: Table<T>) => JSX.Element;
  renderExtra?: (table: Table<T>) => JSX.Element;
};

/**
 * Basic table view.
 */
export function BaseTableView<T>({
  title,
  records,
  columns,
  clear,
  renderActions,
  renderExtra,
}: BaseTableViewProps<T>) {
  const { t } = useTranslation();

  // Control modal visibility for previewing media and JSON data.
  const [mediaPreview, setMediaPreview] = useSignalState('');
  const [rawDataPreview, setRawDataPreview] = useSignalState<T | null>(null);

  // Initialize the table instance.
  // TODO: implement server-side pagination, sorting, and filtering.
  const table = useReactTable<T>({
    data: records ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      mediaPreview,
      setMediaPreview: (url) => setMediaPreview(url),
      rawDataPreview,
      setRawDataPreview: (data) => setRawDataPreview(data),
    },
  });

  // Control modal visibility for exporting data.
  const [showExportDataModal, toggleShowExportDataModal] = useToggle();

  // Select all rows by default.
  useEffect(() => {
    setTimeout(() => {
      if (!table.getIsSomeRowsSelected()) {
        table.toggleAllRowsSelected(true);
      }
    }, 100);
  }, [table]);

  return (
    <>
      <SearchArea defaultValue={table.getState().globalFilter} onChange={table.setGlobalFilter} />
      {/* Data view. */}
      <main class="max-w-full grow overflow-scroll bg-base-200 overscroll-none">
        <table class="table table-pin-rows table-border-bc table-padding-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && (
                      <IconSortAscending size={15} class="inline align-top ml-1" />
                    )}
                    {header.column.getIsSorted() === 'desc' && (
                      <IconSortDescending size={15} class="inline align-top ml-1" />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Empty view. */}
        {table.getRowModel().rows.length > 0 ? null : (
          <div class="flex items-center justify-center h-[320px] w-full">
            <p class="text-base-content text-opacity-50">{t('No data available.')}</p>
          </div>
        )}
      </main>
      {/* Page navigation. */}
      <Pagination table={table} />
      {/* Action buttons. */}
      <div class="flex mt-3 space-x-2">
        <button class="btn btn-neutral btn-ghost" onClick={clear}>
          {t('Clear')}
        </button>
        <span class="flex-grow" />
        {renderActions?.(table)}
        <button class="btn btn-primary" onClick={toggleShowExportDataModal}>
          {t('Export Data')}
        </button>
      </div>
      {/* Extra modal for previewing JSON data. */}
      <Modal
        title={t('JSON View')}
        class="max-w-xl"
        show={!!rawDataPreview}
        onClose={() => setRawDataPreview(null)}
      >
        <main class="max-w-full max-h-[500px] overflow-scroll overscroll-none">
          {typeof rawDataPreview === 'string' ? (
            <p class="whitespace-pre-wrap">{rawDataPreview}</p>
          ) : (
            <pre class="text-xs leading-none">{JSON.stringify(rawDataPreview, null, 2)}</pre>
          )}
        </main>
      </Modal>
      {/* Extra modal for previewing images and videos. */}
      <Modal
        title={t('Media View')}
        class="max-w-xl"
        show={!!mediaPreview}
        onClose={() => setMediaPreview('')}
      >
        <main class="max-w-full">
          {mediaPreview.includes('.mp4') ? (
            <video controls class="w-full max-h-[400px] object-contain" src={mediaPreview} />
          ) : (
            <img class="w-full max-h-[400px] object-contain" src={mediaPreview} />
          )}
        </main>
      </Modal>
      {/* Extra modal for previewing JSON data. */}
      <ExportDataModal
        title={title}
        table={table}
        show={showExportDataModal}
        onClose={toggleShowExportDataModal}
      />
      {/* Extra contents. */}
      {renderExtra?.(table)}
    </>
  );
}
