import { Tweet, User } from '@/types';
import {
  extractTweetMedia,
  getFileExtensionFromUrl,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
} from '@/utils/api';
import { FileLike } from './download';

/**
 * Extract media from tweets and users.
 */
export function extractMedia(data: Tweet[] | User[], includeRetweets: boolean): FileLike[] {
  const gallery = new Map<string, FileLike>();

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

      for (const media of tweetMedia) {
        gallery.set(media.filename, media);
      }
    }

    // For users, download their profile images and banners.
    if (item.__typename === 'User') {
      if (item.legacy.profile_image_url_https) {
        const ext = getFileExtensionFromUrl(item.legacy.profile_image_url_https);
        const filename = `${item.legacy.screen_name}_profile_image.${ext}`;
        gallery.set(filename, {
          filename,
          url: getProfileImageOriginalUrl(item.legacy.profile_image_url_https),
        });
      }

      if (item.legacy.profile_banner_url) {
        const ext = getFileExtensionFromUrl(item.legacy.profile_banner_url);
        const filename = `${item.legacy.screen_name}_profile_banner.${ext}`;
        gallery.set(filename, {
          filename,
          url: item.legacy.profile_banner_url,
        });
      }
    }
  }

  return Array.from(gallery.values());
}
