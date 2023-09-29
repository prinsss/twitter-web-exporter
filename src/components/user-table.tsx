import { useState } from 'preact/hooks';
import { Signal } from '@preact/signals';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/table-core';

import { User } from '@/types';
import { formatDateTime, parseTwitterDateTime, strEntitiesToHTML } from '@/utils';
import { getProfileImageOriginalUrl } from '@/utils/api';
import { flexRender, useReactTable } from '@/utils/react-table';

import { Modal, SearchArea } from './common';

/** Show a preview modal for profile images. */
const mediaPreviewSignal = new Signal<string>('');

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('rest_id', {
    header: () => <span>ID</span>,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.screen_name', {
    header: () => <span>Screen Name</span>,
    cell: (info) => (
      <p class="whitespace-pre">
        <a class="link" target="_blank" href={`https://twitter.com/${info.getValue()}`}>
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('legacy.name', {
    header: () => <span>Profile Name</span>,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.description', {
    header: () => <span>Description</span>,
    cell: (info) => (
      <p
        class="w-52"
        dangerouslySetInnerHTML={{
          __html: strEntitiesToHTML(
            info.row.original.legacy.description,
            info.row.original.legacy.entities.description.urls,
          ),
        }}
      />
    ),
  }),
  columnHelper.accessor('legacy.profile_image_url_https', {
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
  columnHelper.accessor('legacy.profile_banner_url', {
    header: () => <span>Profile Banner</span>,
    cell: (info) => (
      <div
        class="cursor-pointer w-36 h-12"
        onClick={() => (mediaPreviewSignal.value = info.getValue() ?? '')}
      >
        {info.getValue() ? (
          <img class="w-auto h-12 rounded" src={`${info.getValue()}/600x200`} />
        ) : (
          <span class="leading-[48px]">N/A</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('legacy.followers_count', {
    header: () => <span>Followers</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.statuses_count', {
    header: () => <span>Statuses</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.favourites_count', {
    header: () => <span>Favourites</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.listed_count', {
    header: () => <span>Listed</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.verified_type', {
    header: () => <span>Verified Type</span>,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('is_blue_verified', {
    header: () => <span>Blue Verified</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.following', {
    header: () => <span>Following</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.followed_by', {
    header: () => <span>Follows You</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
    header: () => <span>Created At</span>,
    cell: (info) => <p class="w-24">{formatDateTime(info.getValue())}</p>,
  }),
];

type UserTableProps = {
  data: User[];
};

/**
 * Render a list of users.
 */
export function UserTable({ data }: UserTableProps) {
  const [details, setDetails] = useState<User | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <SearchArea onChange={setGlobalFilter} />
      <table class="table table-pin-rows table-border-bc table-padding-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
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
      {/* Extra modal for previewing profile images. */}
      <Modal
        title="Media View"
        class="max-w-xl"
        show={!!mediaPreviewSignal.value}
        onClose={() => (mediaPreviewSignal.value = '')}
      >
        <main class="max-w-full">
          <img class="w-full max-h-[400px] object-contain" src={mediaPreviewSignal.value} />
        </main>
      </Modal>
    </div>
  );
}
