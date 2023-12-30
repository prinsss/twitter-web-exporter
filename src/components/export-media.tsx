import { Signal, useComputed } from '@preact/signals';
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-preact';

import { FileLike, ProgressCallback, extractMedia } from '@/utils/exporter';
import { Modal } from '@/components/common';
import { Tweet, User } from '@/types';
import { useSignalState, cx, useSignal } from '@/utils';
import { zipStreamDownload } from '@/utils/download';
import logger from '@/utils/logger';

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
  const [rateLimit, setRateLimit] = useSignalState(1000);

  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);

  const taskStatusSignal = useSignal<Record<string, number>>({});

  const onProgress: ProgressCallback<FileLike> = (current, total, value) => {
    setCurrentProgress(current);
    setTotalProgress(total);

    if (value?.filename) {
      const updated = { ...taskStatusSignal.value, [value.filename]: 100 };
      taskStatusSignal.value = updated;
    }
  };

  const onExport = async () => {
    try {
      setLoading(true);
      await zipStreamDownload(
        `twitter-${title}-${Date.now()}-media.zip`,
        mediaList.value,
        onProgress,
      );
      setLoading(false);
    } catch (err) {
      setLoading(false);
      logger.error('Failed to export media. Open DevTools for more details.', err);
    }
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
          <p class="mr-2 leading-8">Download as zip archive:</p>
          <input type="checkbox" checked class="checkbox checkbox-sm" disabled />
        </div>
        <div class="flex items-center">
          <p class="mr-2 leading-8">Rate limit (ms):</p>
          <input
            type="number"
            class="input input-bordered input-sm w-32"
            value={rateLimit}
            onChange={(e) => {
              const value = parseInt((e?.target as HTMLInputElement)?.value);
              setRateLimit(value || 0);
            }}
          />
        </div>
        {/* Media list preview. */}
        <div class="my-3 max-h-60 overflow-scroll overscroll-none">
          <table class="table table-xs table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>File Name</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.value.map((media, index) => (
                <tr>
                  <td>
                    {taskStatusSignal.value[media.filename] ? (
                      <IconCircleCheck class="text-success" size={14} />
                    ) : (
                      <IconCircleDashed size={14} />
                    )}
                  </td>
                  <th>{index + 1}</th>
                  <td>{media.filename}</td>
                  <td>
                    <a
                      class="link whitespace-nowrap"
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {media.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mediaList.value.length > 0 ? null : (
            <div class="flex items-center justify-center h-28 w-full">
              <p class="text-base-content text-opacity-50">No media available.</p>
            </div>
          )}
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
