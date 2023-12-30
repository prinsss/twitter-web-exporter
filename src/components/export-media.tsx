import { Signal, useComputed } from '@preact/signals';
import { Modal } from '@/components/common';
import { useSignalState, cx } from '@/utils';
import { ProgressCallback, extractMedia } from '@/utils/exporter';
import { Tweet, User } from '@/types';

type ExportMediaModalProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  show?: boolean;
  onClose?: () => void;
};

/**
 * Modal for exporting media.
 */
export function ExportMediaModal<T>({
  title,
  recordsSignal,
  show,
  onClose,
}: ExportMediaModalProps<T>) {
  const mediaList = useComputed(() => extractMedia(recordsSignal.value as Tweet[] | User[]));

  const [loading, setLoading] = useSignalState(false);
  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);

  const onProgress: ProgressCallback = (current, total) => {
    setCurrentProgress(current);
    setTotalProgress(total);
  };

  const onExport = async () => {
    setLoading(true);
    setLoading(false);
  };

  return (
    <Modal
      class="max-w-sm md:max-w-screen-sm sm:max-w-screen-sm"
      title={`${title} Media`}
      show={show}
      onClose={onClose}
    >
      {/* Modal content. */}
      <div class="px-4 text-base">
        <p class="text-base-content text-opacity-60 mb-2 leading-5 text-sm">
          Download and save media files from captured data. This may take a while depending on the
          amount of data. Media that will be downloaded includes: profile images, profile banners
          (for users), images, videos (for tweets).
        </p>
        {/* Export options. */}
        <div class="flex items-center">
          <p class="mr-2 leading-8">Media files to download:</p>
          <span class="font-mono leading-6 h-6 bg-base-200 px-2 rounded-md">
            {mediaList.value.length}
          </span>
        </div>
        <div class="flex items-center">
          <p class="mr-2 leading-8">Download as zip archive:</p>
          <input type="checkbox" checked={false} class="checkbox checkbox-sm" disabled />
        </div>
        {/* Media list preview. */}
        <div class="mt-2 flex flex-col max-h-48 bg-base-200 py-1 overflow-y-scroll rounded-box-half text-base-content text-opacity-80 font-mono text-sm overscroll-none [&>a]:px-2 [&>a]:py-0.5 [&>a:hover]:bg-base-300">
          {mediaList.value.map((media, index) => (
            <a href={media.url} target="_blank" rel="noopener noreferrer">
              {index + 1}. {media.filename}
            </a>
          ))}
          {!mediaList.value.length && <a>No media found.</a>}
        </div>
        {/* Progress bar. */}
        <div class="flex flex-col mt-6">
          <progress
            class="progress progress-secondary w-full"
            value={(currentProgress / (totalProgress || 1)) * 100}
            max="100"
          />
          <span class="text-sm leading-none mt-2 text-base-content text-opacity-60">
            {`${currentProgress}/${totalProgress || mediaList.value.length}`}
          </span>
        </div>
      </div>
      {/* Action buttons. */}
      <div class="flex space-x-2">
        <span class="flex-grow" />
        <button class="btn" onClick={onClose}>
          Cancel
        </button>
        <button class={cx('btn btn-secondary', loading && 'btn-disabled')} onClick={onExport}>
          {loading && <span class="loading loading-spinner" />}
          Start Export
        </button>
      </div>
    </Modal>
  );
}
