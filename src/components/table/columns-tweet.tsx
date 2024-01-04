import { createColumnHelper } from '@tanstack/table-core';
import {
  formatDateTime,
  formatVideoDuration,
  parseTwitterDateTime,
  strEntitiesToHTML,
} from '@/utils/common';
import { Tweet } from '@/types';
import {
  extractRetweetedTweet,
  extractTweetMedia,
  extractTweetUserScreenName,
  formatTwitterImage,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
  extractQuotedTweet,
  extractTweetFullText,
} from '@/utils/api';

const columnHelper = createColumnHelper<Tweet>();

// Extract the screen name of the retweeted tweet.
const rtSourceAccessor = (row: Tweet) => {
  const source = extractRetweetedTweet(row);
  return source ? extractTweetUserScreenName(source) : null;
};

// Extract the screen name of the quoted tweet.
const quoteSourceAccessor = (row: Tweet) => {
  const source = extractQuotedTweet(row);
  return source ? extractTweetUserScreenName(source) : null;
};

/**
 * Table columns definition for tweets.
 */
export const columns = [
  columnHelper.display({
    id: 'select',
    meta: { exportable: false },
    header: ({ table }) => (
      <input
        type="checkbox"
        class="checkbox checkbox-sm align-middle"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        class="checkbox checkbox-sm"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.accessor('rest_id', {
    meta: { exportKey: 'id', exportHeader: 'ID' },
    header: () => <span>ID</span>,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
    meta: {
      exportKey: 'created_at',
      exportHeader: 'Date',
      exportValue: (row) => row.original.legacy.created_at,
    },
    header: () => <span>Date</span>,
    cell: (info) => (
      <p class="w-24">
        <a
          class="link"
          target="_blank"
          href={`https://twitter.com/i/status/${info.row.original.legacy.id_str}`}
        >
          {formatDateTime(info.getValue())}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('legacy.full_text', {
    meta: {
      exportKey: 'full_text',
      exportHeader: 'Content',
      exportValue: (row) => extractTweetFullText(row.original),
    },
    header: () => <span>Content</span>,
    cell: (info) => (
      <div>
        <p
          class="w-60 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: strEntitiesToHTML(info.row.original.legacy.full_text, [
              ...info.row.original.legacy.entities.urls,
              ...(info.row.original.legacy.entities.media ?? []),
            ]),
          }}
        />
        {info.row.original.note_tweet && (
          <button
            class="link"
            onClick={() =>
              info.table.options.meta?.setRawDataPreview(
                extractTweetFullText(info.row.original) as any,
              )
            }
          >
            {'>>'} Show Full Text
          </button>
        )}
      </div>
    ),
  }),
  columnHelper.accessor((row) => extractTweetMedia(row).length, {
    id: 'media',
    meta: {
      exportKey: 'media',
      exportHeader: 'Media',
      exportValue: (row) =>
        extractTweetMedia(row.original).map((media) => ({
          type: media.type,
          url: media.url,
          thumbnail: formatTwitterImage(media.media_url_https, 'thumb'),
          original: getMediaOriginalUrl(media),
        })),
    },
    header: () => <span>Media</span>,
    cell: (info) => (
      <div class="flex flex-row items-start space-x-1 w-max">
        {extractTweetMedia(info.row.original).map((media) => (
          <div
            key={media.media_key}
            class="flex-shrink-0 block cursor-pointer relative w-12 h-12 rounded"
            onClick={() => info.table.options.meta?.setMediaPreview(getMediaOriginalUrl(media))}
          >
            <img
              class="w-full h-full object-cover"
              src={formatTwitterImage(media.media_url_https, 'thumb')}
            />
            {/* Show video duration or GIF. */}
            {media.type !== 'photo' && (
              <div class="absolute bottom-0.5 left-0.5 h-4 w-max px-0.5 text-xs text-white bg-black bg-opacity-30 leading-4 text-center rounded">
                {media.type === 'video'
                  ? formatVideoDuration(media.video_info?.duration_millis)
                  : 'GIF'}
              </div>
            )}
          </div>
        ))}
        {extractTweetMedia(info.row.original).length ? null : 'N/A'}
      </div>
    ),
  }),
  columnHelper.accessor('core.user_results.result.legacy.screen_name', {
    meta: { exportKey: 'screen_name', exportHeader: 'Screen Name' },
    header: () => <span>Screen Name</span>,
    cell: (info) => (
      <p class="whitespace-pre">
        <a class="link" target="_blank" href={`https://twitter.com/${info.getValue()}`}>
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('core.user_results.result.legacy.name', {
    meta: { exportKey: 'name', exportHeader: 'Profile Name' },
    header: () => <span>Profile Name</span>,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('core.user_results.result.legacy.profile_image_url_https', {
    meta: { exportKey: 'profile_image_url', exportHeader: 'Profile Image' },
    header: () => <span>Profile Image</span>,
    cell: (info) => (
      <div
        class="cursor-pointer"
        onClick={() =>
          info.table.options.meta?.setMediaPreview(getProfileImageOriginalUrl(info.getValue()))
        }
      >
        <img class="w-12 h-12 rounded" src={info.getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor('legacy.in_reply_to_screen_name', {
    meta: {
      exportKey: 'in_reply_to',
      exportHeader: 'Replying To',
      exportValue: (row) => row.original.legacy.in_reply_to_status_id_str,
    },
    header: () => <span>Replying To</span>,
    cell: (info) => (
      <p class="whitespace-pre">
        {info.row.original.legacy.in_reply_to_status_id_str ? (
          <a
            class="link"
            target="_blank"
            href={`https://twitter.com/i/status/${info.row.original.legacy.in_reply_to_status_id_str}`}
          >
            @{info.getValue()}
          </a>
        ) : (
          'N/A'
        )}
      </p>
    ),
  }),
  columnHelper.accessor(rtSourceAccessor, {
    id: 'rt_source',
    meta: {
      exportKey: 'retweeted_status',
      exportHeader: 'RT Source',
      exportValue: (row) => extractRetweetedTweet(row.original)?.rest_id,
    },
    header: () => <span>RT Source</span>,
    cell: (info) => {
      const source = extractRetweetedTweet(info.row.original);
      return (
        <p class="whitespace-pre">
          {source ? (
            <a class="link" target="_blank" href={`https://twitter.com/i/status/${source.rest_id}`}>
              @{info.getValue()}
            </a>
          ) : (
            'N/A'
          )}
        </p>
      );
    },
  }),
  columnHelper.accessor(quoteSourceAccessor, {
    id: 'quote_source',
    meta: {
      exportKey: 'quoted_status',
      exportHeader: 'Quote Source',
      exportValue: (row) => extractQuotedTweet(row.original)?.rest_id,
    },
    header: () => <span>Quote Source</span>,
    cell: (info) => {
      const source = extractQuotedTweet(info.row.original);
      return (
        <p class="whitespace-pre">
          {source ? (
            <a class="link" target="_blank" href={`https://twitter.com/i/status/${source.rest_id}`}>
              @{info.getValue()}
            </a>
          ) : (
            'N/A'
          )}
        </p>
      );
    },
  }),
  columnHelper.accessor('legacy.favorite_count', {
    meta: { exportKey: 'favorite_count', exportHeader: 'Favorites' },
    header: () => <span>Favorites</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.retweet_count', {
    meta: { exportKey: 'retweet_count', exportHeader: 'Retweets' },
    header: () => <span>Retweets</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.bookmark_count', {
    meta: { exportKey: 'bookmark_count', exportHeader: 'Bookmarks' },
    header: () => <span>Bookmarks</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.quote_count', {
    meta: { exportKey: 'quote_count', exportHeader: 'Quotes' },
    header: () => <span>Quotes</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.reply_count', {
    meta: { exportKey: 'reply_count', exportHeader: 'Replies' },
    header: () => <span>Replies</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('views.count', {
    meta: {
      exportKey: 'views_count',
      exportHeader: 'Views',
      exportValue: (row) =>
        typeof row.original.views.count === 'undefined' ? null : +row.original.views.count,
    },
    header: () => <span>Views</span>,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('legacy.favorited', {
    meta: { exportKey: 'favorited', exportHeader: 'Favorited' },
    header: () => <span>Favorited</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.retweeted', {
    meta: { exportKey: 'retweeted', exportHeader: 'Retweeted' },
    header: () => <span>Retweeted</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.bookmarked', {
    meta: { exportKey: 'bookmarked', exportHeader: 'Bookmarked' },
    header: () => <span>Bookmarked</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.display({
    id: 'actions',
    meta: { exportable: false },
    header: () => <span>Actions</span>,
    cell: (info) => (
      <div class="flex flex-row items-start space-x-1">
        <button
          onClick={() => info.table.options.meta?.setRawDataPreview(info.row.original)}
          class="btn btn-xs btn-neutral whitespace-nowrap"
        >
          Details
        </button>
      </div>
    ),
  }),
];
