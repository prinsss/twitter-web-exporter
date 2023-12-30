import { Signal } from '@preact/signals';
import { Modal } from '@/components/common';
import { useSignalState, cx } from '@/utils';
import { EXPORT_FORMAT, ExportFormatType, ProgressCallback, exportData } from '@/utils/exporter';
import { Tweet, User } from '@/types';

type ExportDataModalProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  show?: boolean;
  onClose?: () => void;
};

/**
 * Modal for exporting data.
 */
export function ExportDataModal<T>({
  title,
  recordsSignal,
  show,
  onClose,
}: ExportDataModalProps<T>) {
  const [selectedFormat, setSelectedFormat] = useSignalState<ExportFormatType>(EXPORT_FORMAT.JSON);
  const [loading, setLoading] = useSignalState(false);

  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);

  const onProgress: ProgressCallback = (current, total) => {
    setCurrentProgress(current);
    setTotalProgress(total);
  };

  const onExport = async () => {
    setLoading(true);
    await exportData(
      recordsSignal.value as Tweet[] | User[],
      selectedFormat,
      `twitter-${title}-${Date.now()}.${selectedFormat.toLowerCase()}`,
      onProgress,
    );
    setLoading(false);
  };

  return (
    <Modal
      class="max-w-sm md:max-w-screen-sm sm:max-w-screen-sm"
      title={`${title} Data`}
      show={show}
      onClose={onClose}
    >
      {/* Modal content. */}
      <div class="px-4 text-base">
        <p class="text-base-content text-opacity-60 mb-2 leading-5 text-sm">
          Export captured data as JSON/HTML/CSV file. This may take a while depending on the amount
          of data. The exported file does not include media files such as images and videos but only
          the URLs.
        </p>
        {/* Export options. */}
        <div class="flex items-center">
          <p class="mr-2 leading-8">Data length:</p>
          <span class="font-mono leading-6 h-6 bg-base-200 px-2 rounded-md">
            {recordsSignal.value.length}
          </span>
        </div>
        <div class="flex items-center">
          <p class="mr-2 leading-8">Include all metadata:</p>
          <input type="checkbox" checked class="checkbox checkbox-sm" />
        </div>
        <div class="flex">
          <p class="mr-2 leading-8">Export as:</p>
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
        {/* Progress bar. */}
        <div class="flex flex-col mt-6">
          <progress
            class="progress progress-primary w-full"
            value={(currentProgress / (totalProgress || 1)) * 100}
            max="100"
          />
          <span class="text-sm leading-none mt-2 text-base-content text-opacity-60">
            {`${currentProgress}/${totalProgress || recordsSignal.value.length}`}
          </span>
        </div>
      </div>
      {/* Action buttons. */}
      <div class="flex space-x-2">
        <span class="flex-grow" />
        <button class="btn" onClick={onClose}>
          Cancel
        </button>
        <button class={cx('btn btn-primary', loading && 'btn-disabled')} onClick={onExport}>
          {loading && <span class="loading loading-spinner" />}
          Start Export
        </button>
      </div>
    </Modal>
  );
}
