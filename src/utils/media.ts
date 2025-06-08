import { Media, Tweet, User } from '@/types';
import {
  extractTweetMedia,
  getFileExtensionFromUrl,
  getMediaIndex,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
} from './api';
import { parseTwitterDateTime } from './common';
import { FileLike } from './download';

export type PatternExtractor = (tweet: Tweet, media: Media) => string;

/**
 * All available patterns for customizing filenames when downloading media files.
 */
export const patterns: Record<string, { description: string; extractor: PatternExtractor }> = {
  id: {
    description: 'The tweet ID',
    extractor: (tweet) => tweet.rest_id,
  },
  screen_name: {
    description: 'The username of tweet author',
    extractor: (tweet) => tweet.core.user_results.result.core.screen_name,
  },
  name: {
    description: 'The profile name of tweet author',
    extractor: (tweet) => tweet.core.user_results.result.core.name,
  },
  index: {
    description: 'The media index in tweet (start from 0)',
    extractor: (tweet, media) => String(getMediaIndex(tweet, media)),
  },
  num: {
    description: 'The order of media in tweet (1/2/3/4)',
    extractor: (tweet, media) => String(getMediaIndex(tweet, media) + 1),
  },
  date: {
    description: 'The post date in YYYYMMDD format',
    extractor: (tweet) => parseTwitterDateTime(tweet.legacy.created_at).format('YYYYMMDD'),
  },
  time: {
    description: 'The post time in HHmmss format',
    extractor: (tweet) => parseTwitterDateTime(tweet.legacy.created_at).format('HHmmss'),
  },
  type: {
    description: 'The media type (photo/video/animated_gif)',
    extractor: (tweet, media) => media.type,
  },
  ext: {
    description: 'The file extension of media (jpg/png/mp4)',
    extractor: (tweet, media) => getFileExtensionFromUrl(getMediaOriginalUrl(media)),
  },
};

export const DEFAULT_MEDIA_TYPES = ['photo', 'video', 'animated_gif'] as const;

/**
 * Extract media from tweets and users.
 */
export function extractMedia(
  data: Tweet[] | User[],
  includeRetweets: boolean,
  filenamePattern: string,
): FileLike[] {
  const gallery = new Map<string, FileLike>();

  for (const item of data) {
    // For tweets, download media files with custom filenames.
    // NOTE: __typename is undefined in TweetWithVisibilityResults.
    if (item.__typename === 'Tweet' || (typeof item.__typename === 'undefined' && 'core' in item)) {
      if (!includeRetweets && item.legacy.retweeted_status_result) {
        continue;
      }

      const tweetMedia = extractTweetMedia(item).map((media) => {
        // Parse and apply custom filename pattern.
        let filename = filenamePattern;
        for (const [key, value] of Object.entries(patterns)) {
          filename = filename.replace(`{${key}}`, value.extractor(item, media));
        }

        return { filename, type: media.type, url: getMediaOriginalUrl(media) };
      });

      for (const media of tweetMedia) {
        gallery.set(media.filename, media);
      }
    }

    // For users, download their profile images and banners.
    if (item.__typename === 'User') {
      if (item.avatar.image_url) {
        const ext = getFileExtensionFromUrl(item.avatar.image_url);
        const filename = `${item.core.screen_name}_profile_image.${ext}`;
        gallery.set(filename, {
          filename,
          type: 'photo',
          url: getProfileImageOriginalUrl(item.avatar.image_url),
        });
      }

      if (item.legacy.profile_banner_url) {
        const ext = getFileExtensionFromUrl(item.legacy.profile_banner_url);
        const filename = `${item.core.screen_name}_profile_banner.${ext}`;
        gallery.set(filename, {
          filename,
          type: 'photo',
          url: item.legacy.profile_banner_url,
        });
      }
    }
  }

  return Array.from(gallery.values());
}
