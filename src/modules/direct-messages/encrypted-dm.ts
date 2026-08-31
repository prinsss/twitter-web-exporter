import { unsafeWindow } from '$';
import { db } from '@/core/database';
import logger from '@/utils/logger';
import { messagesSignal, harvestUsers, usersCollection, persistMessages } from './api';
import { Message, EncryptedDmMedia } from './types';
import { parseContents } from './encrypted-dm-media';

/**
 * Capture for the new end-to-end encrypted DMs ("encrypted DM").
 *
 * Unlike legacy DMs, these never arrive as plaintext over the network (the
 * GraphQL API only ships `encoded_message_events`). The web client decrypts
 * them locally and stores the plaintext in a SQLite database that lives in a
 * Web Worker (sqlite-wasm + OPFS). We passively hook `Worker.postMessage` to
 * OBSERVE the queries the client runs against that database and read back the
 * decrypted rows, normalizing them into the same `Message` shape used by the
 * legacy DM interceptor.
 *
 * Media is end-to-end encrypted too: the row's `contents` (CBOR) carries only
 * metadata, and the actual file lives encrypted on X's CDN. The web client
 * downloads + decrypts it and shows it as a `blob:` URL, so we also hook
 * `URL.createObjectURL` to grab the decrypted bytes and match them to the
 * attachment by `SHA-256(plaintext) === mediaHashBase64`.
 *
 * We never post our own messages to the worker: injecting queries trips X
 * Chat's integrity check, which reloads the page and re-locks the session.
 */

const globalObject = unsafeWindow ?? window ?? globalThis;

interface EncryptedDmEntry {
  entry_id: string;
  conversation_id: string;
  timestamp: number;
  /** `message` for real messages, `informational` for system events, etc. */
  entry_type: string;
  sender_id: string;
  plain_text: string | null;
  media: EncryptedDmMedia[];
}

/** Whether we are currently ingesting captured rows (toggled by the module). */
let capturing = false;

export function setEncryptedDmCapturing(value: boolean) {
  capturing = value;
}

/** `mediaHashBase64` -> the media object stored on a captured message. */
const mediaByHash = new Map<string, EncryptedDmMedia>();
/** Decrypted blobs captured before their message metadata was seen. */
const pendingBlobs = new Map<string, { objectUrl: string; blob: Blob }>();

/** `conversation_id` -> friendly chat metadata (group title / avatar). */
export const conversationMeta = new Map<string, { title?: string; avatarUrl?: string }>();

/** The current user's numeric id (from the `twid` cookie / `sender_is_owner`). */
let ownerId = '';

function ownerIdFromCookie(): string {
  // twid cookie looks like `u%3D<id>` -> decoded `u=<id>`.
  return /(\d+)/.exec(readCookie('twid'))?.[1] ?? '';
}

export function getOwnerId() {
  if (!ownerId) {
    ownerId = ownerIdFromCookie();
  }
  return ownerId;
}

/**
 * Load persisted messages on startup so DirectMessages survives reloads. The
 * resolved @handles aren't persisted (usersCollection is in-memory), so we
 * re-resolve them via the active lookup, and recover the owner id from the
 * `twid` cookie.
 */
export async function loadPersistedMessages() {
  ownerId = ownerId || ownerIdFromCookie();
  if (ownerId) {
    resolveOwnerHandle(ownerId);
  }

  const stored = await db.extGetMessages<Message>();
  if (!stored.length) {
    return;
  }

  // Merge with anything captured this session, dedupe by id, order by time.
  const byId = new Map(messagesSignal.value.map((m) => [m.id, m]));
  for (const message of stored) {
    if (!byId.has(message.id)) {
      byId.set(message.id, message);
    }
  }
  messagesSignal.value = [...byId.values()].sort((a, b) => Number(a.time) - Number(b.time));

  // Rebuild participant sets and re-resolve handles for the restored messages.
  for (const message of messagesSignal.value) {
    const senderId = message.message_data?.sender_id;
    if (!senderId) {
      continue;
    }
    let senders = conversationSenders.get(message.conversation_id);
    if (!senders) {
      senders = new Set();
      conversationSenders.set(message.conversation_id, senders);
    }
    senders.add(senderId);
    queueUserLookup(senderId);
  }
}

/**
 * Our own profile isn't part of the harvested fetch/XHR responses (it's baked
 * into the initial page), so the owner stays a numeric id. Read our @handle
 * from the nav profile link in the DOM and map it to the owner id. No-op once
 * resolved.
 */
function resolveOwnerHandle(id: string) {
  if (!id || usersCollection.has(id)) {
    return;
  }
  const href = globalObject.document
    ?.querySelector('[data-testid="AppTabBar_Profile_Link"]')
    ?.getAttribute('href');
  const handle = (href ?? '')
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\//, '')
    .split('/')[0];
  if (handle && /^[A-Za-z0-9_]{1,20}$/.test(handle)) {
    harvestUsers({ id_str: id, screen_name: handle });
    messagesSignal.value = [...messagesSignal.value];
  }
}

// --- Active user lookup ----------------------------------------------------
// X caches participant profiles and doesn't re-fetch them when you open a
// group, so the passive harvester never sees them. We resolve the missing ids
// ourselves via X's own `GetUsersByIdsForXChat` endpoint, reusing the page's
// auth (public bearer + the `ct0` cookie as CSRF). This hits X's normal API,
// not the encrypted worker, so there is no re-lock risk.

const DEFAULT_BEARER =
  'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
let bearerToken = DEFAULT_BEARER;
let usersByIdsQueryId = '2jiOJf7Xr0Lcr3pDxGWp-g';
let pageFetch: typeof fetch | null = null;

/** `conversation_id` -> the sender ids seen there (to name untitled groups). */
export const conversationSenders = new Map<string, Set<string>>();

const lookupQueue = new Set<string>();
const lookupAttempted = new Set<string>();
let lookupTimer: ReturnType<typeof setTimeout> | null = null;

function readCookie(name: string): string {
  const match = globalObject.document?.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

function queueUserLookup(id: string) {
  if (!id || usersCollection.has(id) || lookupAttempted.has(id)) {
    return;
  }
  lookupQueue.add(id);
  if (!lookupTimer) {
    lookupTimer = setTimeout(flushUserLookup, 1000);
  }
}

async function flushUserLookup() {
  lookupTimer = null;
  const ids = [...lookupQueue].filter((id) => !usersCollection.has(id)).slice(0, 100);
  lookupQueue.clear();
  ids.forEach((id) => lookupAttempted.add(id));

  const csrf = readCookie('ct0');
  if (!ids.length || !pageFetch || !csrf) {
    return;
  }

  const variables = encodeURIComponent(JSON.stringify({ ids }));
  const url = `https://api.x.com/graphql/${usersByIdsQueryId}/GetUsersByIdsForXChat?variables=${variables}`;
  try {
    const response = await pageFetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        authorization: bearerToken,
        'x-csrf-token': csrf,
        'apollo-require-preflight': 'true',
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      return;
    }
    if (harvestUsers(await response.json())) {
      messagesSignal.value = [...messagesSignal.value];
    }
  } catch {
    // Network/CORS error; leave the ids numeric.
  }
}

/** Capture the public bearer from X's own XHR requests (override the default). */
function installAuthCapture() {
  const proto = globalObject.XMLHttpRequest?.prototype;
  if (!proto) {
    return;
  }
  const original = proto.setRequestHeader;
  proto.setRequestHeader = function (name: string, value: string) {
    if (name.toLowerCase() === 'authorization' && value.startsWith('Bearer ')) {
      bearerToken = value;
    }
    return original.call(this, name, value);
  };
}

/** Match the local queries we care about. */
const DM_ENTRY_FROM = /\bfrom\s+dm_entry\b/i;
const DM_CONVERSATION_FROM = /\bfrom\s+dm_conversation\b/i;

interface PendingQuery {
  columns: string[];
  kind: 'entry' | 'conversation';
}

/** Extract column names from a `SELECT <cols> FROM ...` statement. */
function parseColumns(sql: string): string[] | null {
  const columnList = /select\s+(.+?)\s+from/is.exec(sql)?.[1];
  if (!columnList) {
    return null;
  }
  return columnList.split(',').map((col) =>
    col
      .trim()
      .replace(/^\w+\./, '')
      .replace(/\s+as\s+\w+$/i, ''),
  );
}

/** Map a positional result row to a typed entry using the query's columns. */
function rowToEntry(columns: string[], row: unknown[]): EncryptedDmEntry {
  const value = (name: string) => row[columns.indexOf(name)];
  const sender = value('sender_id');
  const senderId = typeof sender === 'bigint' ? sender.toString() : String(sender ?? '');

  // Learn the current user's id so 1:1 chats can show the *other* participant,
  // and resolve our own @handle from the DOM (our profile isn't fetched).
  if (senderId && Number(value('sender_is_owner')) === 1) {
    ownerId = senderId;
    resolveOwnerHandle(ownerId);
  }

  // Prefer the original-cased text from the CBOR; the `plain_text` column is
  // lowercased (search-normalized). Fall back to it only if the CBOR has none.
  const { text: contentsText, media } = parseContents(value('contents'), senderId);
  const plainTextColumn = value('plain_text');
  const fallback = typeof plainTextColumn === 'string' ? plainTextColumn : null;

  return {
    entry_id: String(value('entry_id') ?? ''),
    conversation_id: String(value('conversation_id') ?? ''),
    timestamp: Number(value('timestamp') ?? 0),
    entry_type: String(value('entry_type') ?? ''),
    sender_id: senderId,
    plain_text: contentsText ?? fallback,
    media,
  };
}

/** Convert a decrypted encrypted DM entry into the legacy `Message` shape. */
function toMessage(entry: EncryptedDmEntry): Message {
  const time = String(entry.timestamp);
  return {
    id: entry.entry_id,
    time,
    affects_sort: true,
    conversation_id: entry.conversation_id,
    message_data: {
      id: entry.entry_id,
      time,
      sender_id: entry.sender_id,
      text: entry.plain_text ?? '',
    },
    encrypted_media: entry.media.length ? entry.media : undefined,
  };
}

async function sha256Base64(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

let hooksInstalled = false;

/** Install the passive Worker + media hooks used to capture encrypted DM. */
export function installEncryptedDmHook() {
  if (hooksInstalled) {
    return;
  }
  hooksInstalled = true;
  installWorkerHook();
  installMediaHook();
  installFetchHook();
  installAuthCapture();
}

/**
 * Hook `fetch` to harvest user profiles. X loads chat-participant profiles via
 * `fetch` (not XHR), so the XHR-based interceptor never sees them; without this
 * the encrypted-DM senders stay as numeric ids instead of @screen_names.
 */
function installFetchHook() {
  const originalFetch = globalObject.fetch;
  if (typeof originalFetch !== 'function') {
    logger.error('DirectMessages: fetch unavailable; cannot resolve encrypted DM @handles.');
    return;
  }
  pageFetch = originalFetch.bind(globalObject);

  globalObject.fetch = function (...args: Parameters<typeof fetch>) {
    // Keep our GetUsersByIdsForXChat query id in sync with the page's.
    try {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request | undefined)?.url;
      const match = url ? /\/graphql\/([^/]+)\/GetUsersByIdsForXChat/.exec(url) : null;
      if (match?.[1]) {
        usersByIdsQueryId = match[1];
      }
    } catch {
      // ignore
    }

    const promise = originalFetch.apply(globalObject, args);
    if (capturing) {
      promise.then(harvestFromResponse).catch(() => {});
    }
    return promise;
  };

  logger.info('DirectMessages: Hooked into fetch for user profiles (passive)');
}

function harvestFromResponse(response: Response) {
  // Only read JSON responses, and never touch the body the app uses (clone it).
  if (!(response.headers.get('content-type') ?? '').includes('json')) {
    return;
  }
  response
    .clone()
    .text()
    .then((text) => {
      if (!text.includes('"screen_name"')) {
        return;
      }
      try {
        if (harvestUsers(JSON.parse(text))) {
          messagesSignal.value = [...messagesSignal.value];
        }
      } catch {
        // Not JSON / unexpected shape; ignore.
      }
    })
    .catch(() => {});
}

function installWorkerHook() {
  const WorkerClass = globalObject.Worker;
  if (!WorkerClass) {
    logger.error('DirectMessages: Worker is not available; cannot capture encrypted DMs.');
    return;
  }

  const pending = new Map<string, PendingQuery>();
  const watched = new WeakSet<Worker>();
  const originalPostMessage = WorkerClass.prototype.postMessage;

  WorkerClass.prototype.postMessage = function (this: Worker, data: unknown, ...rest: unknown[]) {
    try {
      const message = data as { sql?: unknown; id?: unknown };
      if (message && typeof message.sql === 'string' && typeof message.id === 'string') {
        const columns = parseColumns(message.sql);
        if (DM_ENTRY_FROM.test(message.sql) && columns?.includes('plain_text')) {
          // The rich query that carries the decrypted message text.
          pending.set(message.id, { columns, kind: 'entry' });
        } else if (DM_CONVERSATION_FROM.test(message.sql) && columns?.includes('custom_title')) {
          // The query that carries the (decrypted) group title and avatar.
          pending.set(message.id, { columns, kind: 'conversation' });
        }
      }
    } catch {
      // Not a DB worker / unexpected payload shape; ignore.
    }

    // Attach a passive listener once per worker to read query results.
    if (!watched.has(this)) {
      watched.add(this);
      this.addEventListener('message', (event: MessageEvent) => {
        handleWorkerResponse(event, pending);
      });
    }

    // @ts-expect-error variadic apply onto the original overloaded method.
    return originalPostMessage.apply(this, [data, ...rest]);
  };

  logger.info('DirectMessages: Hooked into SQLite Worker for encrypted DM (passive)');
}

function handleWorkerResponse(event: MessageEvent, pending: Map<string, PendingQuery>) {
  const data = event.data as { id?: string; results?: { values?: unknown[][] } };
  if (!data?.id || !pending.has(data.id)) {
    return;
  }

  const { columns, kind } = pending.get(data.id)!;
  pending.delete(data.id);

  const rows = data.results?.values ?? [];
  if (!rows.length) {
    return;
  }

  if (kind === 'conversation') {
    ingestConversations(columns, rows);
  } else {
    ingestEntries(rows.map((row) => rowToEntry(columns, row)));
  }
}

function ingestConversations(columns: string[], rows: unknown[][]) {
  if (!capturing) {
    return;
  }

  let changed = false;
  for (const row of rows) {
    const value = (name: string) => row[columns.indexOf(name)];
    const id = String(value('conversation_id') ?? '');
    if (!id) {
      continue;
    }
    const title = value('custom_title');
    const avatar = value('custom_avatar_url');
    const meta = conversationMeta.get(id) ?? {};
    if (typeof title === 'string' && title && meta.title !== title) {
      meta.title = title;
      changed = true;
    }
    if (typeof avatar === 'string' && avatar && meta.avatarUrl !== avatar) {
      meta.avatarUrl = avatar;
      changed = true;
    }
    conversationMeta.set(id, meta);
  }

  // Reassign to re-render rows whose chat name/avatar just became known.
  if (changed) {
    messagesSignal.value = [...messagesSignal.value];
  }
}

function ingestEntries(entries: EncryptedDmEntry[]) {
  if (!capturing) {
    return;
  }

  // Keep only real messages that carry decrypted text; drop system events.
  const messages = entries.filter(
    (entry) => entry.entry_type === 'message' && entry.plain_text != null,
  );
  if (!messages.length) {
    return;
  }

  // Track participants per conversation (to name untitled groups) and resolve
  // any sender id we don't have a @handle for yet.
  for (const entry of messages) {
    let senders = conversationSenders.get(entry.conversation_id);
    if (!senders) {
      senders = new Set();
      conversationSenders.set(entry.conversation_id, senders);
    }
    senders.add(entry.sender_id);
    queueUserLookup(entry.sender_id);
  }

  // Deduplicate against what we've already captured: the client re-runs this
  // query every time a conversation is opened or scrolled.
  const seen = new Set(messagesSignal.value.map((m) => m.id));
  const added: Message[] = [];

  for (const entry of messages) {
    if (seen.has(entry.entry_id)) {
      continue;
    }
    const message = toMessage(entry);
    added.push(message);

    // Register each attachment so a decrypted blob can be matched to it later
    // (or immediately, if its blob was already captured).
    for (const media of message.encrypted_media ?? []) {
      mediaByHash.set(media.mediaHashBase64, media);
      const blob = pendingBlobs.get(media.mediaHashBase64);
      if (blob) {
        media.objectUrl = blob.objectUrl;
        media.blob = blob.blob;
        pendingBlobs.delete(media.mediaHashBase64);
      }
    }
  }

  if (!added.length) {
    return;
  }

  messagesSignal.value = [...messagesSignal.value, ...added];
  persistMessages(added);
  logger.info(`DirectMessages: ${added.length} encrypted DM message(s) captured`);
}

function installMediaHook() {
  const urlClass = globalObject.URL;
  if (!urlClass?.createObjectURL) {
    logger.error(
      'DirectMessages: URL.createObjectURL unavailable; cannot capture encrypted DM media.',
    );
    return;
  }

  const originalCreate = urlClass.createObjectURL.bind(urlClass);

  urlClass.createObjectURL = function (object: Blob | MediaSource) {
    const objectUrl = originalCreate(object);
    if (capturing && object instanceof Blob && /^(image|video)\//.test(object.type)) {
      matchDecryptedBlob(object, objectUrl);
    }
    return objectUrl;
  };

  logger.info('DirectMessages: Hooked into URL.createObjectURL for encrypted DM media (passive)');
}

async function matchDecryptedBlob(blob: Blob, objectUrl: string) {
  let hash: string;
  try {
    hash = await sha256Base64(await blob.arrayBuffer());
  } catch {
    return;
  }

  const media = mediaByHash.get(hash);
  if (media) {
    media.objectUrl = objectUrl;
    media.blob = blob;
    // Reassign to trigger a table re-render with the new thumbnail.
    messagesSignal.value = [...messagesSignal.value];
  } else {
    // The message metadata hasn't been ingested yet; hold the blob for it.
    pendingBlobs.set(hash, { objectUrl, blob });
  }
}
