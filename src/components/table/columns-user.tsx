import { createColumnHelper } from '@tanstack/table-core';
import { IconLink } from '@tabler/icons-preact';
import { formatDateTime, parseTwitterDateTime, strEntitiesToHTML } from '@/utils/common';
import { getProfileImageOriginalUrl, getUserURL } from '@/utils/api';
import { options } from '@/core/storage';
import { Trans } from '@/i18n';
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
    header: () => <Trans i18nKey="ID" />,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.screen_name', {
    meta: { exportKey: 'screen_name', exportHeader: 'Screen Name' },
    header: () => <Trans i18nKey="Screen Name" />,
    cell: (info) => (
      <p class="whitespace-pre">
        <a class="link" target="_blank" href={getUserURL(info.row.original)}>
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor('legacy.name', {
    meta: { exportKey: 'name', exportHeader: 'Profile Name' },
    header: () => <Trans i18nKey="Profile Name" />,
    cell: (info) => <p class="w-32">{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.description', {
    meta: { exportKey: 'description', exportHeader: 'Description' },
    header: () => <Trans i18nKey="Description" />,
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
  columnHelper.accessor('legacy.profile_banner_url', {
    meta: { exportKey: 'profile_banner_url', exportHeader: 'Profile Banner' },
    header: () => <Trans i18nKey="Profile Banner" />,
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
    header: () => <Trans i18nKey="Followers" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.statuses_count', {
    meta: { exportKey: 'statuses_count', exportHeader: 'Statuses' },
    header: () => <Trans i18nKey="Statuses" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.favourites_count', {
    meta: { exportKey: 'favourites_count', exportHeader: 'Favourites' },
    header: () => <Trans i18nKey="Favourites" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.listed_count', {
    meta: { exportKey: 'listed_count', exportHeader: 'Listed' },
    header: () => <Trans i18nKey="Listed" />,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.verified_type', {
    meta: { exportKey: 'verified_type', exportHeader: 'Verified Type' },
    header: () => <Trans i18nKey="Verified Type" />,
    cell: (info) => <p>{info.getValue() ?? 'N/A'}</p>,
  }),
  columnHelper.accessor('is_blue_verified', {
    meta: { exportKey: 'is_blue_verified', exportHeader: 'Blue Verified' },
    header: () => <Trans i18nKey="Blue Verified" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.following', {
    meta: { exportKey: 'following', exportHeader: 'Following' },
    header: () => <Trans i18nKey="Following" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.followed_by', {
    meta: { exportKey: 'followed_by', exportHeader: 'Follows You' },
    header: () => <Trans i18nKey="Follows You" />,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor((row) => +parseTwitterDateTime(row.legacy.created_at), {
    id: 'created_at',
    meta: {
      exportKey: 'created_at',
      exportHeader: 'Created At',
      exportValue: (row) =>
        formatDateTime(
          parseTwitterDateTime(row.original.legacy.created_at),
          options.get('dateTimeFormat'),
        ),
    },
    header: () => <Trans i18nKey="Created At" />,
    cell: (info) => (
      <p class="w-24">{formatDateTime(info.getValue(), options.get('dateTimeFormat'))}</p>
    ),
  }),
  columnHelper.display({
    id: 'url',
    meta: {
      exportKey: 'url',
      exportHeader: 'URL',
      exportValue: (row) => getUserURL(row.original),
    },
    header: () => <Trans i18nKey="URL" />,
    cell: (info) => (
      <a href={getUserURL(info.row.original)} target="_blank">
        <IconLink />
      </a>
    ),
  }),
];
