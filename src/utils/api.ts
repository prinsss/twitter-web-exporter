import {
  Media,
  TimelineAddEntriesInstruction,
  TimelineEntry,
  TimelineInstructions,
  TimelineTimelineItem,
  TimelineTimelineModule,
  TimelineTweet,
  TimelineUser,
  Tweet,
  TweetUnion,
  User,
} from '@/types';
import logger from './logger';

/**
 * A generic function to extract data from the API response.
 *
 * @param response The XHR object.
 * @param extractInstructionsFromJson Get "TimelineAddEntries" instructions from the JSON object.
 * @param extractDataFromTimelineEntry Get user/tweet data from the timeline entry.
 * @param onNewDataReceived Returns the extracted data.
 */
export function extractDataFromResponse<
  R,
  T extends User | Tweet,
  P extends TimelineUser | TimelineTweet = T extends User ? TimelineUser : TimelineTweet,
>(
  response: XMLHttpRequest,
  extractInstructionsFromJson: (json: R) => TimelineInstructions,
  extractDataFromTimelineEntry: (entry: TimelineEntry<P, TimelineTimelineItem<P>>) => T | null,
): T[] {
  const json: R = JSON.parse(response.responseText);
  const instructions = extractInstructionsFromJson(json);

  const timelineAddEntriesInstruction = instructions.find(
    (i) => i.type === 'TimelineAddEntries',
  ) as TimelineAddEntriesInstruction<P>;

  const newData: T[] = [];

  for (const entry of timelineAddEntriesInstruction.entries) {
    if (isTimelineEntryItem<P>(entry)) {
      const data = extractDataFromTimelineEntry(entry);
      if (data) {
        newData.push(data);
      }
    }
  }

  return newData;
}

/**
 * Tweets with visibility limitation have an additional layer of nesting.
 * Extract the real tweet object from the wrapper.
 */
export function extractTimelineTweet(itemContent: TimelineTweet): Tweet | null {
  return extractTweetUnion(itemContent.tweet_results.result);
}

/*
|--------------------------------------------------------------------------
| Type predicates.
|
| Use these functions to narrow down the type of timeline entries.
|--------------------------------------------------------------------------
*/

export function isTimelineEntryItem<T extends TimelineTweet | TimelineUser>(
  entry: TimelineEntry,
): entry is TimelineEntry<T, TimelineTimelineItem<T>> {
  return entry.content.entryType === 'TimelineTimelineItem';
}

export function isTimelineEntryTweet(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>> {
  return (
    isTimelineEntryItem<TimelineTweet>(entry) &&
    entry.entryId.startsWith('tweet-') &&
    entry.content.itemContent.__typename === 'TimelineTweet'
  );
}

export function isTimelineEntryUser(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineUser, TimelineTimelineItem<TimelineUser>> {
  return (
    isTimelineEntryItem<TimelineUser>(entry) &&
    entry.entryId.startsWith('user-') &&
    entry.content.itemContent.__typename === 'TimelineUser'
  );
}

export function isTimelineEntryModule<T extends TimelineTweet | TimelineUser>(
  entry: TimelineEntry,
): entry is TimelineEntry<T, TimelineTimelineModule<T>> {
  return entry.content.entryType === 'TimelineTimelineModule';
}

export function isTimelineEntryConversationThread(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineModule<TimelineTweet>> {
  return (
    isTimelineEntryModule<TimelineTweet>(entry) &&
    entry.entryId.startsWith('conversationthread-') &&
    Array.isArray(entry.content.items)
  );
}

export function isTimelineEntryProfileConversation(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineModule<TimelineTweet>> {
  return (
    isTimelineEntryModule<TimelineTweet>(entry) &&
    entry.entryId.startsWith('profile-conversation-') &&
    Array.isArray(entry.content.items)
  );
}

/*
|--------------------------------------------------------------------------
| Object extractors.
|
| Use these functions to extract data from the API response.
|--------------------------------------------------------------------------
*/

export function extractTweetUnion(tweet: TweetUnion): Tweet | null {
  try {
    if (tweet.__typename === 'Tweet') {
      return tweet;
    }

    if (tweet.__typename === 'TweetWithVisibilityResults') {
      return tweet.tweet;
    }

    if (tweet.__typename === 'TweetTombstone') {
      logger.warn(`TweetTombstone received (Reason: ${tweet.tombstone?.text?.text})`, tweet);
      return null;
    }

    if (tweet.__typename === 'TweetUnavailable') {
      logger.warn('TweetUnavailable received (Reason: unknown)', tweet);
      return null;
    }

    logger.errorWithBanner('Unknown tweet type received');
  } catch (err) {
    logger.errorWithBanner('Failed to extract tweet', err as Error);
  }

  return null;
}

export function extractRetweetedTweet(tweet: Tweet): Tweet | null {
  if (tweet.legacy.retweeted_status_result?.result) {
    return extractTweetUnion(tweet.legacy.retweeted_status_result.result);
  }

  return null;
}

export function extractQuotedTweet(tweet: Tweet): Tweet | null {
  if (tweet.quoted_status_result?.result) {
    return extractTweetUnion(tweet.quoted_status_result.result);
  }

  return null;
}

export function extractTweetUserScreenName(tweet: Tweet): string {
  return tweet.core.user_results.result.legacy.screen_name;
}

export function extractTweetMedia(tweet: Tweet): Media[] {
  // Always use the real tweet object for retweeted tweets
  // since Twitter may truncate the media list for retweets.
  const realTweet = extractRetweetedTweet(tweet) ?? tweet;

  // Prefer `extended_entities` over `entities` for media list.
  if (realTweet.legacy.extended_entities?.media) {
    return realTweet.legacy.extended_entities.media;
  }

  return realTweet.legacy.entities.media ?? [];
}

export function extractTweetFullText(tweet: Tweet): string {
  return tweet.note_tweet?.note_tweet_results.result.text ?? tweet.legacy.full_text;
}

/*
|--------------------------------------------------------------------------
| Media operations.
|
| Use these functions to manipulate media URLs.
|--------------------------------------------------------------------------
*/

export function getMediaOriginalUrl(media: Media): string {
  // For videos, use the highest bitrate variant.
  if (media.type === 'video' || media.type === 'animated_gif') {
    const variants = media.video_info?.variants ?? [];
    let maxBitrateVariant = variants[0];

    for (const variant of variants) {
      if (variant.bitrate && variant.bitrate > (maxBitrateVariant?.bitrate ?? 0)) {
        maxBitrateVariant = variant;
      }
    }

    return maxBitrateVariant?.url ?? media.media_url_https;
  }

  // For photos, use the original size.
  return formatTwitterImage(media.media_url_https, 'orig');
}

export function formatTwitterImage(
  imgUrl: string,
  name: 'thumb' | 'small' | 'medium' | 'large' | 'orig' = 'medium',
): string {
  const regex = /^(https?:\/\/pbs\.twimg\.com\/media\/.+)\.(\w+)$/;
  const match = imgUrl.match(regex);

  if (!match) {
    return `${imgUrl}?name=${name}`;
  }

  const [, url, ext] = match;
  return `${url}?format=${ext}&name=${name}`;
}

export function getProfileImageOriginalUrl(url: string): string {
  return url.replace(/_normal\.(jpe?g|png|gif)$/, '.$1');
}

export function getFileExtensionFromUrl(url: string): string {
  // https://pbs.twimg.com/media/F1aT_M9aAAEgJwi.jpg
  // https://pbs.twimg.com/media/F1aT_M9aAAEgJwi?format=jpg&name=orig
  // https://video.twimg.com/ext_tw_video/1724535034051166208/pu/vid/avc1/1508x1080/xU8GJO6bXmUurBIf.mp4?tag=14
  // https://pbs.twimg.com/card_img/1740118695274536960/Y1NUiWkZ?format=png&name=orig
  // https://pbs.twimg.com/profile_images/1652878800311427073/j0-3owJd_normal.jpg
  // https://pbs.twimg.com/profile_banners/4686835494/1698680296
  const regex = /format=(\w+)|\.(\w+)$|\.(\w+)\?.+$/;
  const match = regex.exec(url);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? 'jpg';
}
