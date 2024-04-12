import { Table } from '@tanstack/table-core';
import { IconCircleCheck, IconCircleDashed, IconInfoCircle } from '@tabler/icons-preact';

import { FileLike, ProgressCallback, zipStreamDownload } from '@/utils/download';
import { DEFAULT_FILENAME_PATTERN, extractMedia, patterns } from '@/utils/media';
import { Modal } from '@/components/common';
import { TranslationKey, useTranslation } from '@/i18n';
import { Tweet, User } from '@/types';
import { useSignalState, cx, useSignal, useToggle } from '@/utils/common';
import logger from '@/utils/logger';

type ExportMediaModalProps<T> = {
  title: string;
  table: Table<T>;
  isTweet?: boolean;
  show?: boolean;
  onClose?: () => void;
};

/**
 * Modal for exporting media.
 */
export function ExportMediaModal<T>({
  title,
  table,
  isTweet,
  show,
  onClose,
}: ExportMediaModalProps<T>) {
  const { t } = useTranslation('exporter');

  const [loading, setLoading] = useSignalState(false);
  const [copied, setCopied] = useSignalState(false);

  const [rateLimit, setRateLimit] = useSignalState(1000);
  const [filenamePattern, setFilenamePattern] = useSignalState(DEFAULT_FILENAME_PATTERN);
  const [includeRetweets, toggleIncludeRetweets] = useToggle(true);

  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);
  const taskStatusSignal = useSignal<Record<string, number>>({});

  const mediaList = extractMedia(
    table.getSelectedRowModel().rows.map((row) => row.original) as Tweet[] | User[],
    includeRetweets,
    filenamePattern,
  );

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
      await zipStreamDownload(`twitter-${title}-${Date.now()}-media.zip`, mediaList, onProgress);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      logger.error(t('Failed to export media. Open DevTools for more details.'), err);
    }
  };

  const onCopy = () => {
    const text = mediaList.map((media) => `${media.url}\n  out=${media.filename}`).join('\n');
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error(t('Failed to copy media URLs. Open DevTools for more details.'), err);
    }
  };

  return (
    <Modal
      class="max-w-sm md:max-w-screen-sm sm:max-w-screen-sm"
      title={`${t(title as TranslationKey, title, { ns: 'common' })} ${t('Media')}`}
      show={show}
      onClose={onClose}
    >
      {/* Modal content. */}
      <div class="px-4 text-base overflow-y-scroll overscroll-none">
        <p class="text-base-content text-opacity-60 leading-5 text-sm">
          {t(
            'Download and save media files from captured data. This may take a while depending on the amount of data. Media that will be downloaded includes: profile images, profile banners (for users), images, videos (for tweets).',
          )}
        </p>
        <div role="alert" class="alert text-sm py-2 mt-2 mb-2">
          <IconInfoCircle size={24} />
          <span>
            {t(
              'For more than 100 media or large files, it is recommended to copy the URLs and download them with an external download manager such as aria2.',
            )}
          </span>
        </div>
        {/* Export options. */}
        {isTweet && (
          <div class="flex items-center h-9">
            <p class="mr-2 leading-8">{t('Filename template:')}</p>
            <div
              class="flex-grow tooltip tooltip-bottom before:whitespace-pre-line before:max-w-max"
              data-tip={Object.entries(patterns)
                .map(([key, value]) => `{${key}} - ${t(value.description as TranslationKey)}`)
                .reduce((acc, cur) => acc + cur + '\n', '')}
            >
              <input
                type="text"
                class="input input-bordered input-sm w-full"
                value={filenamePattern}
                onChange={(e) => {
                  setFilenamePattern((e?.target as HTMLInputElement)?.value);
                }}
              />
            </div>
          </div>
        )}
        <div class="flex h-9 justify-between">
          <div class="flex items-center h-9 w-1/2">
            <p class="mr-2 leading-8">{t('Rate limit (ms):')}</p>
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
          <div class="flex items-center h-9 w-1/2">
            <p class="mr-2 leading-8">{t('Include retweets:')}</p>
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              checked={includeRetweets}
              onChange={toggleIncludeRetweets}
            />
          </div>
        </div>
        {/* Media list preview. */}
        <div class="my-3 overflow-x-scroll">
          <table class="table table-xs table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>{t('File Name')}</th>
                <th>{t('Download URL')}</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((media, index) => (
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
          {mediaList.length > 0 ? null : (
            <div class="flex items-center justify-center h-28 w-full">
              <p class="text-base-content text-opacity-50">{t('No media selected.')}</p>
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
          <span class="text-sm h-2 leading-none mt-2 text-base-content text-opacity-60">
            {`${currentProgress}/${mediaList.length}`}
          </span>
        </div>
      </div>
      {/* Action buttons. */}
      <div class="flex space-x-2 mt-2">
        <span class="flex-grow" />
        <button class="btn" onClick={onClose}>
          {t('Cancel')}
        </button>
        <button class="btn" onClick={onCopy}>
          {copied ? t('Copied!') : t('Copy URLs')}
        </button>
        <button class={cx('btn btn-secondary', loading && 'btn-disabled')} onClick={onExport}>
          {loading && <span class="loading loading-spinner" />}
          {t('Start Export')}
        </button>
      </div>
    </Modal>
  );
}
