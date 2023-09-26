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
  User,
} from '@/types';

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
  extractDataFromTimelineEntry: (entry: TimelineEntry<P, TimelineTimelineItem<P>>) => T | undefined,
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
export function extractTweetWithVisibility(itemContent: TimelineTweet): Tweet {
  const result = itemContent.tweet_results.result;

  if (result.__typename === 'TweetWithVisibilityResults') {
    return result.tweet;
  }

  return result;
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

export function extractRetweetedTweet(tweet: Tweet): Tweet | undefined {
  if (tweet.legacy.retweeted_status_result) {
    const result = tweet.legacy.retweeted_status_result.result;
    return result.__typename === 'TweetWithVisibilityResults' ? result.tweet : result;
  }

  return undefined;
}

export function extractTweetUserScreenName(tweet: Tweet | undefined): string | undefined {
  return tweet?.core.user_results.result.legacy.screen_name;
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

    return maxBitrateVariant.url;
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
