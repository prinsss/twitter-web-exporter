import { Table } from '@tanstack/table-core';
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-preact';
import { Modal } from '@/components/common';
import { Tweet, User } from '@/types';
import { useSignalState, cx, useSignal, useToggle } from '@/utils';
import { FileLike, ProgressCallback, zipStreamDownload } from '@/utils/download';
import logger from '@/utils/logger';
import {
  extractTweetMedia,
  getFileExtensionFromUrl,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
} from '@/utils/api';

type ExportMediaModalProps<T> = {
  title: string;
  table: Table<T>;
  show?: boolean;
  onClose?: () => void;
};

/**
 * Extract media from tweets and users.
 */
export function extractMedia(data: Tweet[] | User[], includeRetweets: boolean): FileLike[] {
  const gallery: { filename: string; url: string }[] = [];

  // TODO: Add options to customize the filename.
  for (const item of data) {
    if (item.__typename === 'Tweet') {
      if (!includeRetweets && item.legacy.retweeted_status_result) {
        continue;
      }

      const tweetMedia = extractTweetMedia(item).map((media, index) => {
        const screenName = item.core.user_results.result.legacy.screen_name;
        const tweetId = item.rest_id;
        const type = media.type;
        const number = index + 1;

        const url = getMediaOriginalUrl(media);
        const ext = getFileExtensionFromUrl(url);

        // "{screen_name}_{rest_id}_photo_1.jpg"
        // "{screen_name}_{rest_id}_video_1.mp4"
        const filename = `${screenName}_${tweetId}_${type}_${number}.${ext}`;
        return { filename, url: url };
      });

      gallery.push(...tweetMedia);
    }

    // For users, download their profile images and banners.
    if (item.__typename === 'User') {
      if (item.legacy.profile_image_url_https) {
        const ext = getFileExtensionFromUrl(item.legacy.profile_image_url_https);
        gallery.push({
          filename: `${item.legacy.screen_name}_profile_image.${ext}`,
          url: getProfileImageOriginalUrl(item.legacy.profile_image_url_https),
        });
      }

      if (item.legacy.profile_banner_url) {
        const ext = getFileExtensionFromUrl(item.legacy.profile_banner_url);
        gallery.push({
          filename: `${item.legacy.screen_name}_profile_banner.${ext}`,
          url: item.legacy.profile_banner_url,
        });
      }
    }
  }

  return gallery;
}

/**
 * Modal for exporting media.
 */
export function ExportMediaModal<T>({ title, table, show, onClose }: ExportMediaModalProps<T>) {
  const [loading, setLoading] = useSignalState(false);
  const [rateLimit, setRateLimit] = useSignalState(1000);
  const [includeRetweets, toggleIncludeRetweets] = useToggle(true);

  const [currentProgress, setCurrentProgress] = useSignalState(0);
  const [totalProgress, setTotalProgress] = useSignalState(0);

  const taskStatusSignal = useSignal<Record<string, number>>({});

  const mediaList = extractMedia(
    table.getSelectedRowModel().rows.map((row) => row.original) as Tweet[] | User[],
    includeRetweets,
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
        <div class="flex items-center">
          <p class="mr-2 leading-8">Include retweets:</p>
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            checked={includeRetweets}
            onChange={toggleIncludeRetweets}
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
              <p class="text-base-content text-opacity-50">No media selected.</p>
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
            {`${currentProgress}/${totalProgress || mediaList.length}`}
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
