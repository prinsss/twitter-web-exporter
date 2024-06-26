import { useEffect } from 'preact/hooks';

import { Modal, SearchArea } from '@/components/common';
import { ExportDataModal } from '@/components/modals/export-data';
import { ExportMediaModal } from '@/components/modals/export-media';
import { useCapturedRecords, useClearCaptures } from '@/core/database/hooks';
import { Extension, ExtensionType } from '@/core/extensions';
import { useTranslation } from '@/i18n';
import { Tweet, User } from '@/types';
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
} from '@tanstack/table-core';

import { columns as columnsTweet } from './columns-tweet';
import { columns as columnsUser } from './columns-user';
import { Pagination } from './pagination';

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

type TableViewProps = {
  title: string;
  extension: Extension;
};

type InferDataType<T> = T extends ExtensionType.TWEET ? Tweet : User;

/**
 * Common table view.
 */
export function TableView({ title, extension }: TableViewProps) {
  const { t } = useTranslation();

  // Infer data type (Tweet or User) from extension type.
  type DataType = InferDataType<typeof extension.type>;

  // Query records from the database.
  const { name, type } = extension;
  const records = useCapturedRecords(name, type);
  const clearCapturedData = useClearCaptures(name);

  // Control modal visibility for exporting data and media.
  const [showExportDataModal, toggleShowExportDataModal] = useToggle();
  const [showExportMediaModal, toggleShowExportMediaModal] = useToggle();

  // Control modal visibility for previewing media and JSON data.
  const [mediaPreview, setMediaPreview] = useSignalState('');
  const [rawDataPreview, setRawDataPreview] = useSignalState<DataType | null>(null);

  // Initialize the table instance.
  // TODO: implement server-side pagination, sorting, and filtering.
  const table = useReactTable<DataType>({
    data: records ?? [],
    columns: (type === ExtensionType.TWEET ? columnsTweet : columnsUser) as ColumnDef<DataType>[],
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
        <button class="btn btn-neutral btn-ghost" onClick={clearCapturedData}>
          {t('Clear')}
        </button>
        <span class="flex-grow" />
        <button class="btn btn-secondary" onClick={toggleShowExportMediaModal}>
          {t('Export Media')}
        </button>
        <button class="btn btn-primary" onClick={toggleShowExportDataModal}>
          {t('Export Data')}
        </button>
      </div>
      {/* Extra modal for exporting data and media. */}
      <ExportDataModal
        title={title}
        table={table}
        show={showExportDataModal}
        onClose={toggleShowExportDataModal}
      />
      <ExportMediaModal
        title={title}
        table={table}
        isTweet={type === ExtensionType.TWEET}
        show={showExportMediaModal}
        onClose={toggleShowExportMediaModal}
      />
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
    </>
  );
}
