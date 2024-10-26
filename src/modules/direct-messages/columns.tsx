import dayjs from 'dayjs';

import { MediaDisplayColumn } from '@/components/common';
import { options } from '@/core/options';
import { Trans } from '@/i18n';
import { formatTwitterImage, getMediaOriginalUrl } from '@/utils/api';
import { formatDateTime, strEntitiesToHTML } from '@/utils/common';
import { createColumnHelper } from '@tanstack/table-core';

import { conversationsCollection, usersCollection } from './api';
import { Message } from './types';

function getUserScreeNameFromId(id: string | undefined) {
  const user = id ? usersCollection.get(id) : null;
  return user ? user.screen_name : '';
}

function getConversationTypeFromId(id: string | undefined) {
  const conversation = id ? conversationsCollection.get(id) : null;
  return conversation ? conversation.type : '';
}

function extractMessageMedia(message: Message) {
  return [
    message.message_data.attachment?.photo,
    message.message_data.attachment?.video,
    message.message_data.attachment?.animated_gif,
  ].filter((m) => !!m);
}

const columnHelper = createColumnHelper<Message>();

/**
 * Table columns definition for direct messages.
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
  columnHelper.accessor('id', {
    meta: { exportKey: 'id', exportHeader: 'ID' },
    header: () => <Trans i18nKey="ID" />,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor('time', {
    meta: {
      exportKey: 'time',
      exportHeader: 'Date',
      exportValue: (row) =>
        formatDateTime(dayjs(+row.original.time), options.get('dateTimeFormat')),
    },
    header: () => <Trans i18nKey="Date" />,
    cell: (info) => (
      <p class="w-24">{formatDateTime(+info.getValue(), options.get('dateTimeFormat'))}</p>
    ),
  }),
  columnHelper.accessor('message_data.text', {
    meta: {
      exportKey: 'text',
      exportHeader: 'Content',
    },
    header: () => <Trans i18nKey="Content" />,
    cell: (info) => (
      <div>
        <p
          class="w-60 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: strEntitiesToHTML(
              info.row.original.message_data.text,
              info.row.original.message_data.entities?.urls,
            ),
          }}
        />
      </div>
    ),
  }),
  columnHelper.accessor((row) => extractMessageMedia(row), {
    id: 'media',
    meta: {
      exportKey: 'media',
      exportHeader: 'Media',
      exportValue: (row) =>
        extractMessageMedia(row.original).map((media) => ({
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
        data={info.getValue().filter((m) => !!m)}
        onClick={(media) => info.table.options.meta?.setMediaPreview(getMediaOriginalUrl(media))}
      />
    ),
  }),
  columnHelper.accessor((row) => getUserScreeNameFromId(row.message_data.sender_id), {
    id: 'sender',
    meta: { exportKey: 'sender', exportHeader: 'Sender' },
    header: () => <Trans i18nKey="Sender" />,
    cell: (info) => (
      <p class="whitespace-pre">
        <a class="link" target="_blank" href={`https://twitter.com/${info.getValue()}`}>
          @{info.getValue()}
        </a>
      </p>
    ),
  }),
  columnHelper.accessor((row) => getUserScreeNameFromId(row.message_data.recipient_id), {
    id: 'recipient',
    meta: { exportKey: 'recipient', exportHeader: 'Recipient' },
    header: () => <Trans i18nKey="Recipient" />,
    cell: (info) => (
      <p class="whitespace-pre">
        {info.getValue() ? (
          <a class="link" target="_blank" href={`https://twitter.com/${info.getValue()}`}>
            @{info.getValue()}
          </a>
        ) : (
          'N/A'
        )}
      </p>
    ),
  }),
  columnHelper.accessor('conversation_id', {
    meta: { exportKey: 'conversation_id', exportHeader: 'Conversation ID' },
    header: () => <Trans i18nKey="Conversation ID" />,
    cell: (info) => <p class="w-20 break-all font-mono text-xs">{info.getValue()}</p>,
  }),
  columnHelper.accessor((row) => getConversationTypeFromId(row.conversation_id), {
    id: 'conversation_type',
    meta: { exportKey: 'conversation_type', exportHeader: 'Conversation Type' },
    header: () => <Trans i18nKey="Conversation Type" />,
    cell: (info) => <p class="whitespace-pre">{info.getValue()}</p>,
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
