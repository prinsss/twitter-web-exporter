import { Signal } from '@preact/signals';
import {
  ColumnDef,
  Row,
  RowData,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/table-core';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-preact';

import { ExtensionPanel, Modal, SearchArea } from '@/components/common';
import { flexRender, useReactTable } from '@/utils/react-table';
import { useSignalState, useToggle } from '@/utils';

import { columns as columnsTweet } from './columns-tweet';
import { columns as columnsUser } from './columns-user';
import { Pagination } from './pagination';
import { ExportDataModal } from './export-data';
import { ExportMediaModal } from './export-media';

// For opening media preview modal in column definitions.
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    mediaPreview: string;
    setMediaPreview: (url: string) => void;
    rawDataPreview: TData | null;
    setRawDataPreview: (data: TData | null) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    exportable?: boolean;
    exportId?: string;
    exportHeader?: string;
    exportValue?: (row: Row<TData>) => any;
  }
}

type ModuleUIProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  isTweet?: boolean;
};

/**
 * A common UI boilerplate for modules.
 */
export function ModuleUI<T>({ title, recordsSignal, isTweet }: ModuleUIProps<T>) {
  const data = recordsSignal.value;

  const [showModal, toggleShowModal] = useToggle();
  const [showExportDataModal, toggleShowExportDataModal] = useToggle();
  const [showExportMediaModal, toggleShowExportMediaModal] = useToggle();

  const [mediaPreview, setMediaPreview] = useSignalState('');
  const [rawDataPreview, setRawDataPreview] = useSignalState<T | null>(null);

  const table = useReactTable<T>({
    data,
    columns: (isTweet ? columnsTweet : columnsUser) as ColumnDef<T, unknown>[],
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

  return (
    <ExtensionPanel
      title={title}
      description={`Captured: ${data.length}`}
      active={data.length > 0}
      onClick={toggleShowModal}
      indicatorColor={isTweet ? 'bg-primary' : 'bg-secondary'}
    >
      <Modal title={title} show={showModal} onClose={toggleShowModal}>
        <SearchArea defaultValue={table.getState().globalFilter} onChange={table.setGlobalFilter} />
        {/* Data view. */}
        <main class="max-w-full h-[600px] overflow-scroll bg-base-200 overscroll-none">
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
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Empty view. */}
          {table.getRowModel().rows.length > 0 ? null : (
            <div class="flex items-center justify-center h-52 w-full">
              <p class="text-base-content text-opacity-50">No data available.</p>
            </div>
          )}
        </main>
        {/* Page navigation. */}
        <Pagination table={table} />
        {/* Action buttons. */}
        <div class="flex mt-3 space-x-2">
          <button
            class="btn btn-neutral btn-ghost"
            onClick={() => {
              recordsSignal.value = [];
            }}
          >
            Clear
          </button>
          <span class="flex-grow" />
          <button class="btn btn-secondary" onClick={toggleShowExportMediaModal}>
            Export Media
          </button>
          <button class="btn btn-primary" onClick={toggleShowExportDataModal}>
            Export Data
          </button>
        </div>
        {/* Extra modal for exporting data and media. */}
        <ExportDataModal
          title={title}
          data={table.getSelectedRowModel().rows.map((row) => row.original)}
          show={showExportDataModal}
          onClose={toggleShowExportDataModal}
        />
        <ExportMediaModal
          title={title}
          data={table.getSelectedRowModel().rows.map((row) => row.original)}
          show={showExportMediaModal}
          onClose={toggleShowExportMediaModal}
        />
        {/* Extra modal for previewing JSON data. */}
        <Modal
          title="JSON View"
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
          title="Media View"
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
      </Modal>
    </ExtensionPanel>
  );
}
