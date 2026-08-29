import type { DataType } from './exporter';

type XquikObject = Record<string, unknown>;

export type XquikTweetRecord = XquikObject;

const asObject = (value: unknown): XquikObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as XquikObject)
    : {};

const pickString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'bigint') {
      return String(value);
    }
  }

  return null;
};

const pickNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const asTweetRecords = (value: unknown): XquikTweetRecord[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is XquikTweetRecord =>
            typeof item === 'object' && item !== null && !Array.isArray(item),
        )
        .filter((item) => pickString(item.id) !== null)
    : [];

const normalizeDate = (...values: unknown[]): string | null => {
  for (const value of values) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim())
          ? Number(value)
          : null;

    if (numeric !== null && Number.isFinite(numeric)) {
      const millis = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
      const date = new Date(millis);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
    }
  }

  return null;
};

export const extractXquikTweetRecords = (value: unknown): XquikTweetRecord[] => {
  const direct = asTweetRecords(value);
  if (direct.length > 0) {
    return direct;
  }

  const envelope = asObject(value);
  return asTweetRecords(envelope.tweets);
};

const normalizeMedia = (value: unknown): DataType[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const media = asObject(item);
      const mediaUrl = pickString(media.mediaUrl, media.media_url);

      return {
        type: pickString(media.type),
        url: pickString(media.url, mediaUrl),
        thumbnail: mediaUrl,
        original: mediaUrl,
        ext_alt_text: pickString(media.altText, media.alt_text),
      };
    })
    .filter((media) => media.original !== null);
};

export const toTwitterWebExporterRows = (records: XquikTweetRecord[]): DataType[] =>
  records.map((record) => {
    const author = asObject(record.author);
    const noteTweet = asObject(record.noteTweet ?? record.note_tweet);
    const quotedTweet = asObject(record.quoted_tweet);
    const retweetedTweet = asObject(record.retweeted_tweet);

    return {
      id: pickString(record.id),
      created_at: normalizeDate(record.createdAt, record.created),
      full_text: pickString(noteTweet.text, record.text),
      screen_name: pickString(author.username),
      name: pickString(author.name),
      profile_image_url: pickString(author.profilePicture, author.profile_picture),
      user_id: pickString(author.id),
      in_reply_to: pickString(record.inReplyToId, record.in_reply_to_id),
      retweeted_status: pickString(retweetedTweet.id),
      quoted_status: pickString(quotedTweet.id),
      favorite_count: pickNumber(record.likeCount, record.like_count),
      retweet_count: pickNumber(record.retweetCount, record.retweet_count),
      bookmark_count: pickNumber(record.bookmarkCount, record.bookmark_count),
      quote_count: pickNumber(record.quoteCount, record.quote_count),
      reply_count: pickNumber(record.replyCount, record.reply_count),
      views_count: pickNumber(record.viewCount, record.view_count),
      media: normalizeMedia(record.media),
      url: pickString(record.url),
      metadata: record,
    };
  });
