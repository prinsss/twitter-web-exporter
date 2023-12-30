import { Tweet, User } from '@/types';
import logger from './logger';
import {
  extractTweetMedia,
  getFileExtensionFromUrl,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
} from './api';

/**
 * Supported formats of exporting.
 */
export const EXPORT_FORMAT = {
  JSON: 'JSON',
  HTML: 'HTML',
  CSV: 'CSV',
} as const;

export type ExportFormatType = (typeof EXPORT_FORMAT)[keyof typeof EXPORT_FORMAT];

export type ProgressCallback<T = unknown> = (current: number, total: number, value?: T) => void;

/**
 * Save a text file to disk.
 */
export function saveFile(filename: string, content: string) {
  const link = document.createElement('a');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data and download as a file.
 */
export async function exportData(
  data: Tweet[] | User[],
  format: ExportFormatType,
  filename: string,
  onProgress?: ProgressCallback,
) {
  try {
    let content = '';
    logger.info(`Exporting to ${format} file: ${filename}`);

    switch (format) {
      case EXPORT_FORMAT.JSON:
        content = await jsonExporter(data, onProgress);
        break;
      case EXPORT_FORMAT.HTML:
        content = await htmlExporter(data, onProgress);
        break;
      case EXPORT_FORMAT.CSV:
        content = await csvExporter(data, onProgress);
        break;
    }

    saveFile(filename, content);
  } catch (err) {
    logger.errorWithBanner('Failed to export file', err as Error);
  }
}

export async function jsonExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  onProgress?.(Math.floor(total / 2), total);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const content = JSON.stringify(data, undefined, '  ');
  onProgress?.(total, total);
  return content;
}

export async function htmlExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  const content = '<html></html>';
  onProgress?.(total, total);
  return content;
}

export async function csvExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  const content = 'id,name';
  onProgress?.(total, total);
  return content;
}

export type FileLike = { filename: string; url: string };

/**
 * Extract media from tweets and users.
 */
export function extractMedia(data: Tweet[] | User[]): FileLike[] {
  const gallery: { filename: string; url: string }[] = [];

  // TODO: options to customize the filename
  for (const item of data) {
    if (item.__typename === 'Tweet') {
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
