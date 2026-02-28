import { createColumnHelper } from '@tanstack/table-core';

import { MediaDisplayColumn } from '@/components/common';
import { options } from '@/core/options';
import { Trans } from '@/i18n';
import { BlueskyPost, Media } from '@/types';
import { formatDateTime } from '@/utils/common';
import { IconLink } from '@tabler/icons-preact';

function getBskyPostURL(uri: string): string {
  // at://did:plc:xxx/app.bsky.feed.post/rkey → https://bsky.app/profile/{did}/post/{rkey}
  const parts = uri.split('/');
  const did = parts[2];
  const rkey = parts[4];
  return `https://bsky.app/profile/${did}/post/${rkey}`;
}

function getBskyProfileURL(handle: string): string {
  return `https://bsky.app/profile/${handle}`;
}

function extractBlueskyMedia(post: BlueskyPost): Media[] {
  const embed = post.embed;
  if (!embed) return [];

  if (embed.$type === 'app.bsky.embed.images#view') {
    return embed.images.map(
      (img, i) =>
        ({
          id_str: String(i),
          media_url_https: img.thumb,
          url: img.fullsize,
          type: 'photo',
          ext_alt_text: img.alt,
        }) as unknown as Media,
    );
  }

  if (embed.$type === 'app.bsky.embed.video#view') {
    return [
      {
        id_str: embed.cid ?? '0',
        media_url_https: embed.thumbnail ?? '',
        url: embed.thumbnail ?? '',
        type: 'video',
      } as unknown as Media,
    ];
  }

  return [];
}

const columnHelper = createColumnHelper<BlueskyPost>();

/**
 * Table columns definition for Bluesky user posts.
 */
export const columnsBlueskyPost = [
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
  columnHelper.accessor('uri', {
    meta: { exportKey: 'uri', exportHeader: 'URI' },
    header: () => <Trans i18nKey="URI" />,
    cell: (info) => (
      <p class="w-32 break-all font-mono text-xs">
        <a class="link" target="_blank" href={getBskyPostURL(info.getValue())}>
          {info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor((row) => new Date(row.record.createdAt).getTime(), {
    id: 'created_at',
    meta: {
      exportKey: 'created_at',
      exportHeader: 'Date',
      exportValue: (row) =>
        formatDateTime(
          new Date(row.original.record.createdAt).getTime(),
          options.get('dateTimeFormat'),
        ),
    },
    header: () => <Trans i18nKey="Date" />,
    cell: (info) => (
      <p class="w-24">
        <a class="link" target="_blank" href={getBskyPostURL(info.row.original.uri)}>
          {formatDateTime(info.getValue(), options.get('dateTimeFormat'))}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('record.text', {
    meta: { exportKey: 'content', exportHeader: 'Content' },
    header: () => <Trans i18nKey="Content" />,
    cell: (info) => <p class="w-60 whitespace-pre-wrap">{info.getValue()}</p>,
  }),
  columnHelper.display({
    id: 'embed',
    meta: {
      exportKey: 'media',
      exportHeader: 'Media',
      exportValue: (row) => {
        const embed = row.original.embed;
        if (!embed) return [];
        if (embed.$type === 'app.bsky.embed.images#view') {
          return embed.images.map((img) => ({
            type: 'image',
            url: img.fullsize,
            thumbnail: img.thumb,
          }));
        }
        if (embed.$type === 'app.bsky.embed.video#view') {
          return [
            {
              type: 'video',
              url: embed.playlist ?? '',
              thumbnail: embed.thumbnail ?? '',
            },
          ];
        }
        return [];
      },
    },
    header: () => <Trans i18nKey="Media" />,
    cell: (info) => (
      <MediaDisplayColumn
        data={extractBlueskyMedia(info.row.original)}
        onClick={(media) => info.table.options.meta?.setMediaPreview(media.url)}
      />
    ),
  }),
  columnHelper.accessor('author.handle', {
    meta: { exportKey: 'handle', exportHeader: 'Handle' },
    header: () => <Trans i18nKey="Handle" />,
    cell: (info) => (
      <p class="whitespace-pre">
        <a class="link" target="_blank" href={getBskyProfileURL(info.getValue())}>
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('author.displayName', {
    meta: { exportKey: 'display_name', exportHeader: 'Profile Name' },
    header: () => <Trans i18nKey="Profile Name" />,
    cell: (info) => <p class="whitespace-pre">{info.getValue() ?? ''}</p>,
  }),
  columnHelper.accessor('author.avatar', {
    meta: { exportKey: 'avatar', exportHeader: 'Profile Image' },
    header: () => <Trans i18nKey="Profile Image" />,
    cell: (info) =>
      info.getValue() ? (
        <img
          src={info.getValue()}
          alt="avatar"
          class="h-12 w-12 rounded-full object-cover cursor-pointer"
          onClick={() => info.table.options.meta?.setMediaPreview(info.getValue()!)}
        />
      ) : null,
  }),
  columnHelper.accessor('author.did', {
    meta: { exportKey: 'did', exportHeader: 'DID' },
    header: () => <Trans i18nKey="DID" />,
    cell: (info) => <p class="w-32 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('likeCount', {
    meta: { exportKey: 'like_count', exportHeader: 'Favourites' },
    header: () => <Trans i18nKey="Favourites" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('repostCount', {
    meta: { exportKey: 'repost_count', exportHeader: 'Reposts' },
    header: () => <Trans i18nKey="Reposts" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('replyCount', {
    meta: { exportKey: 'reply_count', exportHeader: 'Replies' },
    header: () => <Trans i18nKey="Replies" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('quoteCount', {
    meta: { exportKey: 'quote_count', exportHeader: 'Quotes' },
    header: () => <Trans i18nKey="Quotes" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('bookmarkCount', {
    meta: { exportKey: 'bookmark_count', exportHeader: 'Bookmarks' },
    header: () => <Trans i18nKey="Bookmarks" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.display({
    id: 'url',
    meta: {
      exportKey: 'url',
      exportHeader: 'URL',
      exportValue: (row) => getBskyPostURL(row.original.uri),
    },
    header: () => <Trans i18nKey="URL" />,
    cell: (info) => (
      <a class="link" target="_blank" href={getBskyPostURL(info.row.original.uri)}>
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
