import { createColumnHelper } from '@tanstack/table-core';
import { formatDateTime, parseTwitterDateTime, strEntitiesToHTML } from '@/utils';
import { getProfileImageOriginalUrl } from '@/utils/api';
import { User } from '@/types';

const columnHelper = createColumnHelper<User>();

/**
 * Table columns definition for users.
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
  columnHelper.accessor('legacy.screen_name', {
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
  columnHelper.accessor('legacy.name', {
    meta: { exportKey: 'name', exportHeader: 'Profile Name' },
    header: () => <span>Profile Name</span>,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.description', {
    meta: { exportKey: 'description', exportHeader: 'Description' },
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
  columnHelper.accessor('legacy.profile_banner_url', {
    meta: { exportKey: 'profile_banner_url', exportHeader: 'Profile Banner' },
    header: () => <span>Profile Banner</span>,
    cell: (info) => (
      <div
        class="cursor-pointer w-36 h-12"
        onClick={() => info.table.options.meta?.setMediaPreview(info.getValue() ?? '')}
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
    meta: { exportKey: 'followers_count', exportHeader: 'Followers' },
    header: () => <span>Followers</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.statuses_count', {
    meta: { exportKey: 'statuses_count', exportHeader: 'Statuses' },
    header: () => <span>Statuses</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.favourites_count', {
    meta: { exportKey: 'favourites_count', exportHeader: 'Favourites' },
    header: () => <span>Favourites</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.listed_count', {
    meta: { exportKey: 'listed_count', exportHeader: 'Listed' },
    header: () => <span>Listed</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.verified_type', {
    meta: { exportKey: 'verified_type', exportHeader: 'Verified Type' },
    header: () => <span>Verified Type</span>,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('is_blue_verified', {
    meta: { exportKey: 'is_blue_verified', exportHeader: 'Blue Verified' },
    header: () => <span>Blue Verified</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.following', {
    meta: { exportKey: 'following', exportHeader: 'Following' },
    header: () => <span>Following</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.followed_by', {
    meta: { exportKey: 'followed_by', exportHeader: 'Follows You' },
    header: () => <span>Follows You</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
    meta: {
      exportKey: 'created_at',
      exportHeader: 'Created At',
      exportValue: (row) => row.original.legacy.created_at,
    },
    header: () => <span>Created At</span>,
    cell: (info) => <p class="w-24">{formatDateTime(info.getValue())}</p>,
  }),
];
