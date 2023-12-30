import { createColumnHelper } from '@tanstack/table-core';
import { formatDateTime, parseTwitterDateTime, strEntitiesToHTML } from '@/utils';
import { Tweet } from '@/types';
import {
  extractRetweetedTweet,
  extractTweetMedia,
  extractTweetUserScreenName,
  formatTwitterImage,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
  extractTweetWithVisibility,
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
    header: () => <span>ID</span>,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
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
    header: () => <span>Media</span>,
    cell: (info) => (
      <div class="flex flex-row items-start space-x-1 w-max">
        {extractTweetMedia(info.row.original).map((media) => (
          <div
            class="flex-shrink-0 block cursor-pointer"
            onClick={() => info.table.options.meta?.setMediaPreview(getMediaOriginalUrl(media))}
          >
            <img
              key={media.media_key}
              class="w-12 h-12 rounded"
              src={formatTwitterImage(media.media_url_https, 'thumb')}
            />
          </div>
        ))}
        {extractTweetMedia(info.row.original).length ? null : 'N/A'}
      </div>
    ),
  }),
  columnHelper.accessor('core.user_results.result.legacy.screen_name', {
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
    header: () => <span>Profile Name</span>,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('core.user_results.result.legacy.profile_image_url_https', {
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
    header: () => <span>Quote Source</span>,
    cell: (info) => {
      const res = info.row.original.quoted_status_result?.result;
      const source = res ? extractTweetWithVisibility(res) : null;
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
    header: () => <span>Favorites</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.retweet_count', {
    header: () => <span>Retweets</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.bookmark_count', {
    header: () => <span>Bookmarks</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.quote_count', {
    header: () => <span>Quotes</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.reply_count', {
    header: () => <span>Replies</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('views.count', {
    header: () => <span>Views</span>,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('legacy.favorited', {
    header: () => <span>Favorited</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.retweeted', {
    header: () => <span>Retweeted</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.bookmarked', {
    header: () => <span>Bookmarked</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.display({
    id: 'actions',
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
