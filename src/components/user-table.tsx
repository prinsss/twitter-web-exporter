import { User } from '@/types';
import { createColumnHelper, getCoreRowModel } from '@tanstack/table-core';
import { flexRender, useReactTable } from '@/utils/react-table';
import { strEntitiesToHTML } from '@/utils';
import { useState } from 'preact/hooks';
import { Modal } from './common';

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
  columnHelper.accessor('legacy.profile_image_url_https', {
    header: () => <span>Profile Image</span>,
    cell: (info) => <img class="w-12 h-12 rounded" src={info.getValue()} />,
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
      ></p>
    ),
  }),
  columnHelper.accessor('legacy.followers_count', {
    header: () => <span>Followers</span>,
    cell: (info) => <p>{info.getValue()}</p>,
  }),
  columnHelper.accessor('legacy.following', {
    header: () => <span>Following</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
  }),
  columnHelper.accessor('legacy.followed_by', {
    header: () => <span>Follows You</span>,
    cell: (info) => <p>{info.getValue() ? 'YES' : 'NO'}</p>,
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div class="overflow-x-auto">
      <table class="table table-border-bc table-padding-sm">
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
    </div>
  );
}
