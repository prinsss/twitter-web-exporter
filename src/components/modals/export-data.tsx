import { Table } from '@tanstack/table-core';
import { Modal } from '@/components/common';
import { TranslationKey, useTranslation } from '@/i18n';
import { useSignalState, cx, useToggle } from '@/utils/common';
import { DataType, EXPORT_FORMAT, ExportFormatType, exportData } from '@/utils/exporter';

type ExportDataModalProps<T> = {
  title: string;
  table: Table<T>;
  show?: boolean;
  onClose?: () => void;
};

/**
 * Modal for exporting data.
 */
export function ExportDataModal<T>({ title, table, show, onClose }: ExportDataModalProps<T>) {
  const { t } = useTranslation('exporter');

  const [selectedFormat, setSelectedFormat] = useSignalState<ExportFormatType>(EXPORT_FORMAT.JSON);
  const [loading, setLoading] = useSignalState(false);

  const [includeMetadata, toggleIncludeMetadata] = useToggle(false);
  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);

  const selectedRows = table.getSelectedRowModel().rows;

  const onExport = async () => {
    setLoading(true);
    setTotalProgress(selectedRows.length);

    const allRecords: Array<DataType> = [];

    // Prepare data for exporting by iterating through all selected rows in the table.
    for (const row of selectedRows) {
      const allCells = row.getAllCells();
      const record: DataType = {};

      for (const cell of allCells) {
        const value = cell.getValue();
        const meta = cell.column.columnDef.meta;

        if (meta?.exportable === false) {
          continue;
        }

        // Get export value of the cell by calling column definition if available.
        let exportValue = meta?.exportValue ? meta.exportValue(row) : value;

        // Avoid exporting undefined values and use null instead.
        if (exportValue === undefined) {
          exportValue = null;
        }

        record[meta?.exportKey || cell.column.id] = exportValue;
      }

      if (includeMetadata) {
        record.metadata = row.original;
      }

      allRecords.push(record);
      setCurrentProgress(allRecords.length);
    }

    // Prepare header translations for the exported data.
    const headerTranslations = table
      .getAllColumns()
      .reduce<Record<string, string>>((acc, column) => {
        const key = column.columnDef.meta?.exportKey || column.id;
        const header = column.columnDef.meta?.exportHeader || column.id;
        acc[key] = t(header as TranslationKey);
        return acc;
      }, {});

    // Convert data to selected format and download it.
    await exportData(
      allRecords,
      selectedFormat,
      `twitter-${title}-${Date.now()}.${selectedFormat.toLowerCase()}`,
      headerTranslations,
    );
    setLoading(false);
  };

  return (
    <Modal
      class="max-w-sm md:max-w-screen-sm sm:max-w-screen-sm max-h-full"
      title={`${title} ${t('Data')}`}
      show={show}
      onClose={onClose}
    >
      {/* Modal content. */}
      <div class="px-4 text-base">
        <p class="text-base-content text-opacity-60 mb-2 leading-5 text-sm">
          {t(
            'Export captured data as JSON/HTML/CSV file. This may take a while depending on the amount of data. The exported file does not include media files such as images and videos but only the URLs.',
          )}
        </p>
        {/* Export options. */}
        <div class="flex items-center">
          <p class="mr-2 leading-8">{t('Data length:')}</p>
          <span class="font-mono leading-6 h-6 bg-base-200 px-2 rounded-md">
            {selectedRows.length}
          </span>
        </div>
        <div class="flex items-center">
          <p class="mr-2 leading-8">{t('Include all metadata:')}</p>
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            checked={includeMetadata}
            onChange={toggleIncludeMetadata}
          />
        </div>
        <div class="flex">
          <p class="mr-2 leading-8">{t('Export as:')}</p>
          <select
            class="select select-bordered select-sm w-32"
            onChange={(e) => {
              setSelectedFormat((e.target as HTMLSelectElement).value as ExportFormatType);
            }}
          >
            {Object.values(EXPORT_FORMAT).map((type) => (
              <option key={type} selected={type === selectedFormat}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {selectedRows.length > 0 ? null : (
          <div class="flex items-center justify-center h-28 w-full">
            <p class="text-base-content text-opacity-50">{t('No data selected.')}</p>
          </div>
        )}
        {/* Progress bar. */}
        <div class="flex flex-col mt-6">
          <progress
            class="progress progress-primary w-full"
            value={(currentProgress / (totalProgress || 1)) * 100}
            max="100"
          />
          <span class="text-sm leading-none mt-2 text-base-content text-opacity-60">
            {`${currentProgress}/${selectedRows.length}`}
          </span>
        </div>
      </div>
      {/* Action buttons. */}
      <div class="flex space-x-2">
        <span class="flex-grow" />
        <button class="btn" onClick={onClose}>
          {t('Cancel')}
        </button>
        <button class={cx('btn btn-primary', loading && 'btn-disabled')} onClick={onExport}>
          {loading && <span class="loading loading-spinner" />}
          {t('Start Export')}
        </button>
      </div>
    </Modal>
  );
}
