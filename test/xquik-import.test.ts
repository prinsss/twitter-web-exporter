import { describe, expect, test } from 'bun:test';
import { extractXquikTweetRecords, toTwitterWebExporterRows } from '../src/utils/xquik-import';

describe('toTwitterWebExporterRows', () => {
  test('converts the documented REST response fields', () => {
    expect.assertions(1);

    const record = {
      id: '1893704267862470862',
      text: 'Short text',
      noteTweet: { text: 'Complete Note Tweet text' },
      createdAt: '2026-05-24T20:32:58.000Z',
      url: 'https://x.com/example/status/1893704267862470862',
      inReplyToId: '1893690000000000000',
      likeCount: 42,
      retweetCount: 8,
      replyCount: 3,
      quoteCount: 2,
      viewCount: 1500,
      bookmarkCount: 4,
      author: {
        id: '123456789',
        username: 'example',
        name: 'Example Account',
        profilePicture: 'https://pbs.twimg.com/profile_images/example/photo.jpg',
      },
      quoted_tweet: { id: '1893600000000000001' },
      retweeted_tweet: { id: '1893600000000000002' },
      media: [
        {
          mediaUrl: 'https://pbs.twimg.com/media/example.jpg',
          type: 'photo',
          url: 'https://x.com/example/status/1893704267862470862/photo/1',
          altText: 'Product dashboard with a tweet search result',
        },
      ],
    };

    expect(toTwitterWebExporterRows([record])).toEqual([
      {
        id: '1893704267862470862',
        created_at: '2026-05-24T20:32:58.000Z',
        full_text: 'Complete Note Tweet text',
        screen_name: 'example',
        name: 'Example Account',
        profile_image_url: 'https://pbs.twimg.com/profile_images/example/photo.jpg',
        user_id: '123456789',
        in_reply_to: '1893690000000000000',
        retweeted_status: '1893600000000000002',
        quoted_status: '1893600000000000001',
        favorite_count: 42,
        retweet_count: 8,
        bookmark_count: 4,
        quote_count: 2,
        reply_count: 3,
        views_count: 1500,
        media: [
          {
            type: 'photo',
            url: 'https://x.com/example/status/1893704267862470862/photo/1',
            thumbnail: 'https://pbs.twimg.com/media/example.jpg',
            original: 'https://pbs.twimg.com/media/example.jpg',
            ext_alt_text: 'Product dashboard with a tweet search result',
          },
        ],
        url: 'https://x.com/example/status/1893704267862470862',
        metadata: record,
      },
    ]);
  });

  test('converts the normalized MCP response fields', () => {
    expect.assertions(5);

    const [row] = toTwitterWebExporterRows([
      {
        id: '1893704267862470862',
        text: 'Short text',
        note_tweet: { text: 'Long text' },
        created: 1_769_817_600,
        like_count: '42',
        view_count: 1500,
        author: { profile_picture: 'https://pbs.twimg.com/profile_images/example/photo.jpg' },
        media: [
          {
            media_url: 'https://pbs.twimg.com/media/example.jpg',
            type: 'photo',
            alt_text: 'Example image',
          },
        ],
      },
    ]);

    expect(row?.full_text).toBe('Long text');
    expect(row?.created_at).toBe('2026-01-31T00:00:00.000Z');
    expect(row?.favorite_count).toBe(42);
    expect(row?.views_count).toBe(1500);
    expect(row?.media).toEqual([
      {
        type: 'photo',
        url: 'https://pbs.twimg.com/media/example.jpg',
        thumbnail: 'https://pbs.twimg.com/media/example.jpg',
        original: 'https://pbs.twimg.com/media/example.jpg',
        ext_alt_text: 'Example image',
      },
    ]);
  });

  test('returns null for an invalid date', () => {
    expect.assertions(1);

    const [row] = toTwitterWebExporterRows([{ id: '42', createdAt: 'not-a-date' }]);

    expect(row?.created_at).toBeNull();
  });
});

describe('extractXquikTweetRecords', () => {
  test('accepts the documented envelope or a tweets array', () => {
    expect.assertions(3);

    const tweet = { id: '1893704267862470862' };

    expect(extractXquikTweetRecords([tweet])).toEqual([tweet]);
    expect(extractXquikTweetRecords({ tweets: [tweet] })).toEqual([tweet]);
    expect(extractXquikTweetRecords({ results: [tweet] })).toEqual([]);
  });

  test('drops non-record values and records without an ID', () => {
    expect.assertions(1);

    expect(extractXquikTweetRecords([null, 'tweet', {}, { id: '42' }])).toEqual([{ id: '42' }]);
  });
});
