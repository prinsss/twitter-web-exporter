import { createColumnHelper } from '@tanstack/table-core';
import { IconLink } from '@tabler/icons-preact';
import { formatDateTime, parseTwitterDateTime, strEntitiesToHTML } from '@/utils/common';
import { options } from '@/core/options';
import { Trans } from '@/i18n';
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
  getTweetURL,
  getUserURL,
  getInReplyToTweetURL,
  extractTweetMediaTags,
} from '@/utils/api';
import { MediaDisplayColumn } from '../common';

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
    header: () => <Trans i18nKey="ID" />,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
    meta: {
      exportKey: 'created_at',
      exportHeader: 'Date',
      exportValue: (row) =>
        formatDateTime(
          parseTwitterDateTime(row.original.legacy.created_at),
          options.get('dateTimeFormat'),
        ),
    },
    header: () => <Trans i18nKey="Date" />,
    cell: (info) => (
      <p class="w-24">
        <a class="link" target="_blank" href={getTweetURL(info.row.original)}>
          {formatDateTime(info.getValue(), options.get('dateTimeFormat'))}
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
    header: () => <Trans i18nKey="Content" />,
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
                extractTweetFullText(info.row.original) as unknown as Tweet,
              )
            }
          >
            {'>>'} <Trans i18nKey="Show Full Text" />
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
          ext_alt_text: media.ext_alt_text,
        })),
    },
    header: () => <Trans i18nKey="Media" />,
    cell: (info) => (
      <MediaDisplayColumn
        data={extractTweetMedia(info.row.original)}
        onClick={(media) => info.table.options.meta?.setMediaPreview(getMediaOriginalUrl(media))}
      />
    ),
  }),
  columnHelper.accessor('core.user_results.result.core.screen_name', {
    meta: { exportKey: 'screen_name', exportHeader: 'Screen Name' },
    header: () => <Trans i18nKey="Screen Name" />,
    cell: (info) => (
      <p class="whitespace-pre">
        <a
          class="link"
          target="_blank"
          href={getUserURL(info.row.original.core.user_results.result)}
        >
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('core.user_results.result.core.name', {
    meta: { exportKey: 'name', exportHeader: 'Profile Name' },
    header: () => <Trans i18nKey="Profile Name" />,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('core.user_results.result.avatar.image_url', {
    meta: { exportKey: 'profile_image_url', exportHeader: 'Profile Image' },
    header: () => <Trans i18nKey="Profile Image" />,
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
  columnHelper.accessor('core.user_results.result.rest_id', {
    meta: { exportKey: 'user_id', exportHeader: 'User ID' },
    header: () => <Trans i18nKey="User ID" />,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.in_reply_to_screen_name', {
    meta: {
      exportKey: 'in_reply_to',
      exportHeader: 'Replying To',
      exportValue: (row) => row.original.legacy.in_reply_to_status_id_str,
    },
    header: () => <Trans i18nKey="Replying To" />,
    cell: (info) => (
      <p class="whitespace-pre">
        {info.row.original.legacy.in_reply_to_status_id_str ? (
          <a class="link" target="_blank" href={getInReplyToTweetURL(info.row.original)}>
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
    header: () => <Trans i18nKey="RT Source" />,
    cell: (info) => {
      const source = extractRetweetedTweet(info.row.original);
      return (
        <p class="whitespace-pre">
          {source ? (
            <a class="link" target="_blank" href={getTweetURL(source)}>
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
    header: () => <Trans i18nKey="Quote Source" />,
    cell: (info) => {
      const source = extractQuotedTweet(info.row.original);
      return (
        <p class="whitespace-pre">
          {source ? (
            <a class="link" target="_blank" href={getTweetURL(source)}>
              @{info.getValue()}
            </a>
          ) : (
            'N/A'
          )}
        </p>
      );
    },
  }),
  columnHelper.display({
    id: 'media_tags',
    meta: {
      exportKey: 'media_tags',
      exportHeader: 'Media Tags',
      exportValue: (row) => extractTweetMediaTags(row.original),
    },
    header: () => <Trans i18nKey="Media Tags" />,
    cell: (info) => (
      <p>
        {extractTweetMediaTags(info.row.original).length
          ? extractTweetMediaTags(info.row.original).map((tag) => (
              <a class="link inline-block" target="_blank" href={getUserURL(tag.screen_name)}>
                @{tag.screen_name}
              </a>
            ))
          : 'N/A'}
      </p>
    ),
  }),
  columnHelper.accessor('legacy.favorite_count', {
    meta: { exportKey: 'favorite_count', exportHeader: 'Favorites' },
    header: () => <Trans i18nKey="Favorites" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.retweet_count', {
    meta: { exportKey: 'retweet_count', exportHeader: 'Retweets' },
    header: () => <Trans i18nKey="Retweets" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.bookmark_count', {
    meta: { exportKey: 'bookmark_count', exportHeader: 'Bookmarks' },
    header: () => <Trans i18nKey="Bookmarks" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.quote_count', {
    meta: { exportKey: 'quote_count', exportHeader: 'Quotes' },
    header: () => <Trans i18nKey="Quotes" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.reply_count', {
    meta: { exportKey: 'reply_count', exportHeader: 'Replies' },
    header: () => <Trans i18nKey="Replies" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('views.count', {
    meta: {
      exportKey: 'views_count',
      exportHeader: 'Views',
      exportValue: (row) =>
        typeof row.original.views?.count === 'undefined' ? null : +row.original.views.count,
    },
    header: () => <Trans i18nKey="Views" />,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('legacy.favorited', {
    meta: { exportKey: 'favorited', exportHeader: 'Favorited' },
    header: () => <Trans i18nKey="Favorited" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.retweeted', {
    meta: { exportKey: 'retweeted', exportHeader: 'Retweeted' },
    header: () => <Trans i18nKey="Retweeted" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.bookmarked', {
    meta: { exportKey: 'bookmarked', exportHeader: 'Bookmarked' },
    header: () => <Trans i18nKey="Bookmarked" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.display({
    id: 'url',
    meta: {
      exportKey: 'url',
      exportHeader: 'URL',
      exportValue: (row) => getTweetURL(row.original),
    },
    header: () => <Trans i18nKey="URL" />,
    cell: (info) => (
      <a href={getTweetURL(info.row.original)} target="_blank">
        <IconLink />
      </a>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    meta: { exportable: false },
    header: () => <Trans i18nKey="Actions" />,
    cell: (info) => (
      <div class="flex flex-row items-start space-x-1">
        <button
          onClick={() => info.table.options.meta?.setRawDataPreview(info.row.original)}
          class="btn btn-xs btn-neutral whitespace-nowrap"
        >
          <Trans i18nKey="Details" />
        </button>
      </div>
    ),
  }),
];
