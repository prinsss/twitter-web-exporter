import { Tweet } from '@/types';
import { createColumnHelper, getCoreRowModel } from '@tanstack/table-core';
import { flexRender, useReactTable } from '@/utils/react-table';
import { strEntitiesToHTML } from '@/utils';
import { useState } from 'preact/hooks';
import { Signal } from '@preact/signals';
import { Modal } from './common';
import {
  extractRetweetedTweet as rt,
  extractTweetMedia,
  extractTweetUserScreenName,
  formatTwitterImage,
  getMediaOriginalUrl,
  getProfileImageOriginalUrl,
} from '@/utils/api';

/** Show a preview modal for images and videos. */
const mediaPreviewSignal = new Signal<string>('');

const columnHelper = createColumnHelper<Tweet>();

const columns = [
  columnHelper.accessor('rest_id', {
    header: () => <span>ID</span>,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.created_at', {
    header: () => <span>Date</span>,
    cell: (info) => (
      <p class="w-32 text-xs">
        <a
          class="link"
          target="_blank"
          href={`https://twitter.com/i/status/${info.row.original.legacy.id_str}`}
        >
          {info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('legacy.full_text', {
    header: () => <span>Content</span>,
    cell: (info) => (
      <p
        class="w-60 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{
          __html: strEntitiesToHTML(info.row.original.legacy.full_text, [
            ...info.row.original.legacy.entities.urls,
            ...(info.row.original.legacy.entities.media ?? []),
          ]),
        }}
      />
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
            onClick={() => (mediaPreviewSignal.value = getMediaOriginalUrl(media))}
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
        onClick={() => (mediaPreviewSignal.value = getProfileImageOriginalUrl(info.getValue()))}
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
  columnHelper.accessor((row) => extractTweetUserScreenName(rt(row)), {
    id: 'rt_source',
    header: () => <span>RT Source</span>,
    cell: (info) => (
      <p class="whitespace-pre">
        {rt(info.row.original)?.rest_id ? (
          <a
            class="link"
            target="_blank"
            href={`https://twitter.com/i/status/${rt(info.row.original)?.rest_id}`}
          >
            @{info.getValue()}
          </a>
        ) : (
          'N/A'
        )}
      </p>
    ),
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
];

type TweetTableProps = {
  data: Tweet[];
};

/**
 * Render a list of tweets.
 */
export function TweetTable({ data }: TweetTableProps) {
  const [details, setDetails] = useState<Tweet | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table class="table table-pin-rows table-border-bc table-padding-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              {/* Extra column. */}
              <th>
                <span>Actions</span>
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
              {/* Extra column. */}
              <td>
                <div class="flex flex-row items-start space-x-1">
                  <button
                    onClick={() => setDetails(row.original)}
                    class="btn btn-xs btn-neutral whitespace-nowrap"
                  >
                    Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Empty view. */}
      {data?.length > 0 ? null : (
        <div class="flex items-center justify-center h-52 w-full">
          <p class="text-base-content text-opacity-50">No data available.</p>
        </div>
      )}
      {/* Extra modal for previewing JSON data. */}
      <Modal title="JSON View" class="max-w-xl" show={!!details} onClose={() => setDetails(null)}>
        <main class="max-w-full max-h-[500px] overflow-scroll">
          <pre class="text-xs leading-none">{JSON.stringify(details, null, 2)}</pre>
        </main>
      </Modal>
      {/* Extra modal for previewing images and videos. */}
      <Modal
        title="Media View"
        class="max-w-xl"
        show={!!mediaPreviewSignal.value}
        onClose={() => (mediaPreviewSignal.value = '')}
      >
        <main class="max-w-full">
          {mediaPreviewSignal.value.includes('.mp4') ? (
            <video
              controls
              class="w-full max-h-[400px] object-contain"
              src={mediaPreviewSignal.value}
            />
          ) : (
            <img class="w-full max-h-[400px] object-contain" src={mediaPreviewSignal.value} />
          )}
        </main>
      </Modal>
    </div>
  );
}
