import dayjs from 'dayjs';

import { MediaDisplayColumn } from '@/components/common';
import { options } from '@/core/options';
import { Trans } from '@/i18n';
import { formatTwitterImage, getMediaOriginalUrl } from '@/utils/api';
import { formatDateTime, strEntitiesToHTML } from '@/utils/common';
import { createColumnHelper } from '@tanstack/table-core';

import { conversationsCollection, usersCollection } from './api';
import { conversationMeta, conversationSenders, getOwnerId } from './encrypted-dm';
import { Message } from './types';
import { EncryptedDmMediaCell } from './encrypted-dm-media-cell';

function getUserScreeNameFromId(id: string | undefined) {
  const user = id ? usersCollection.get(id) : null;
  return user ? user.screen_name : '';
}

/**
 * Resolve a participant to a display value. Legacy DMs have a screen name in
 * `usersCollection`; encrypted DM messages only carry a numeric user id, so we fall
 * back to that (linked to the by-id profile URL in the cell).
 */
function getSenderDisplay(id: string | undefined) {
  return getUserScreeNameFromId(id) || id || '';
}

/** Build a profile URL, handling both screen names and numeric user ids. */
function profileUrl(value: string) {
  return /^\d+$/.test(value)
    ? `https://twitter.com/i/user/${value}`
    : `https://twitter.com/${value}`;
}

function getConversationTypeFromId(id: string | undefined) {
  const conversation = id ? conversationsCollection.get(id) : null;
  return conversation ? conversation.type : '';
}

/**
 * Friendly name + avatar for a conversation: the group title when set, otherwise
 * the other participant's @handle (encrypted-DM 1:1 ids look like `owner-other`).
 */
function getChatDisplay(conversationId: string): { name: string; avatarUrl?: string } {
  const meta = conversationMeta.get(conversationId);
  if (meta?.title) {
    return { name: meta.title, avatarUrl: meta.avatarUrl };
  }
  const owner = getOwnerId();
  const resolve = (id: string) => {
    const handle = getUserScreeNameFromId(id);
    return handle ? `@${handle}` : id;
  };
  // 1:1 ids look like `owner:other` (or `owner-other`).
  const [a, b] = conversationId.split(/[-:]/);
  if (a && b && /^\d+$/.test(a) && /^\d+$/.test(b)) {
    return { name: resolve(a === owner ? b : a), avatarUrl: meta?.avatarUrl };
  }
  // Untitled group: compose the name from the participants we've seen.
  const senders = conversationSenders.get(conversationId);
  if (senders) {
    const names = [...senders].filter((id) => id !== owner).map(resolve);
    if (names.length) {
      return { name: names.join(', '), avatarUrl: meta?.avatarUrl };
    }
  }
  return { name: conversationId, avatarUrl: meta?.avatarUrl };
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
      exportValue: (row) => {
        const legacy = extractMessageMedia(row.original).map((media) => ({
          type: media.type,
          url: media.url,
          thumbnail: formatTwitterImage(media.media_url_https, 'thumb'),
          original: getMediaOriginalUrl(media),
          ext_alt_text: media.ext_alt_text,
        }));
        // encrypted DM media is E2E encrypted: `url` points at the ciphertext, the
        // actual file is only available as a live blob during the session.
        const encrypted = (row.original.encrypted_media ?? []).map((media) => ({
          type: media.type,
          url: media.url,
          filename: media.filename,
          width: media.width,
          height: media.height,
          bytes: media.fileSizeBytes,
          attachmentId: media.attachmentId,
        }));
        return [...legacy, ...encrypted];
      },
    },
    header: () => <Trans i18nKey="Media" />,
    cell: (info) => {
      const encryptedMedia = info.row.original.encrypted_media;
      if (encryptedMedia?.length) {
        return (
          <EncryptedDmMediaCell
            media={encryptedMedia}
            onPreview={(url) => info.table.options.meta?.setMediaPreview(url)}
          />
        );
      }
      return (
        <MediaDisplayColumn
          data={info.getValue().filter((m) => !!m)}
          onClick={(media) => info.table.options.meta?.setMediaPreview(getMediaOriginalUrl(media))}
        />
      );
    },
  }),
  columnHelper.accessor((row) => getSenderDisplay(row.message_data.sender_id), {
    id: 'sender',
    meta: { exportKey: 'sender', exportHeader: 'Sender' },
    header: () => <Trans i18nKey="Sender" />,
    cell: (info) => {
      const value = info.getValue();
      const isId = /^\d+$/.test(value);
      return (
        <p class="whitespace-pre">
          <a class="link" target="_blank" href={profileUrl(value)}>
            {isId ? value : `@${value}`}
          </a>
        </p>
      );
    },
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
  columnHelper.accessor((row) => getChatDisplay(row.conversation_id).name, {
    id: 'chat',
    meta: { exportKey: 'chat', exportHeader: 'Chat' },
    header: () => <Trans i18nKey="Chat" />,
    cell: (info) => {
      const { name, avatarUrl } = getChatDisplay(info.row.original.conversation_id);
      return (
        <div class="flex items-center space-x-1 w-max">
          {avatarUrl && (
            <img
              class="w-6 h-6 rounded-full object-cover flex-shrink-0"
              src={avatarUrl}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span class="whitespace-pre">{name}</span>
        </div>
      );
    },
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
