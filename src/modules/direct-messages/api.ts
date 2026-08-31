import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import logger from '@/utils/logger';
import {
  Conversation,
  ConversationResponse,
  DmEntry,
  InboxInitialStateResponse,
  InboxTimelineTrustedResponse,
  LegacyUser,
  Message,
} from './types';

/**
 * The global store for "DirectMessages".
 *
 * Still use signal here instead of storing to database since
 * it's a new data type and we are not ready to add new tables yet.
 */
export const messagesSignal = signal<Message[]>([]);
export const conversationsCollection = new Map<string, Conversation>();
export const usersCollection = new Map<string, LegacyUser>();

/** Strip session-only media (the decrypted blob/objectUrl) before persisting. */
function forStorage(message: Message): Message {
  if (!message.encrypted_media?.length) {
    return message;
  }
  return {
    ...message,
    encrypted_media: message.encrypted_media.map((media) => ({
      ...media,
      blob: undefined,
      objectUrl: undefined,
    })),
  };
}

/** Persist newly captured messages so they survive page reloads. */
export function persistMessages(messages: Message[]) {
  if (messages.length) {
    db.extAddMessages(messages.map(forStorage)).catch(() => {});
  }
}

/** Clear both the in-memory store and the persisted table. */
export function clearMessages() {
  messagesSignal.value = [];
  db.extClearMessages().catch(() => {});
}

type Strategy = {
  test: (url: string) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse: (json: any) => {
    entries: DmEntry[];
    conversations: Conversation[];
    users: LegacyUser[];
  };
};

// We need to intercept multiple API endpoints to get direct messages.
const strategies: Strategy[] = [
  {
    test: (url) => /\/dm\/inbox_initial_state\.json/.test(url),
    parse: (json: InboxInitialStateResponse) => ({
      entries: json.inbox_initial_state.entries,
      conversations: Object.values(json.inbox_initial_state.conversations),
      users: Object.values(json.inbox_initial_state.users),
    }),
  },
  {
    test: (url) => /\/dm\/inbox_timeline\/trusted\.json/.test(url),
    parse: (json: InboxTimelineTrustedResponse) => ({
      entries: json.inbox_timeline.entries,
      conversations: Object.values(json.inbox_timeline.conversations),
      users: Object.values(json.inbox_timeline.users),
    }),
  },
  {
    test: (url) => /\/dm\/conversation\/\d+-?\d+\.json/.test(url),
    parse: (json: ConversationResponse) => ({
      entries: json.conversation_timeline.entries,
      conversations: Object.values(json.conversation_timeline.conversations),
      users: Object.values(json.conversation_timeline.users),
    }),
  },
];

/** Store a minimal user record used to resolve sender ids to @screen_names. */
function addUser(id: string, screenName: string, name?: string): boolean {
  if (!id || !screenName) {
    return false;
  }
  const existing = usersCollection.get(id);
  if (existing && existing.screen_name === screenName) {
    return false;
  }
  usersCollection.set(id, {
    id_str: id,
    screen_name: screenName,
    name: name ?? screenName,
  } as LegacyUser);
  return true;
}

/**
 * Recursively harvest X user objects from any intercepted JSON response so that
 * numeric sender ids (e.g. from encrypted DMs, whose local DB only stores ids)
 * can be resolved to @screen_names. Handles both the legacy shape
 * (`id_str` + `screen_name`) and the GraphQL shape (`rest_id` +
 * `legacy`/`core`.`screen_name`).
 */
export function harvestUsers(node: unknown): boolean {
  let found = false;
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = value as any;

    // Flat user object: a screen name (snake or camel) + an id on the same node.
    const screenName =
      typeof obj.screen_name === 'string'
        ? obj.screen_name
        : typeof obj.screenName === 'string'
          ? obj.screenName
          : undefined;
    if (screenName) {
      const id =
        typeof obj.id_str === 'string'
          ? obj.id_str
          : typeof obj.rest_id === 'string'
            ? obj.rest_id
            : typeof obj.restId === 'string'
              ? obj.restId
              : typeof obj.id === 'string'
                ? obj.id
                : undefined;
      if (id) {
        found =
          addUser(id, screenName, typeof obj.name === 'string' ? obj.name : undefined) || found;
      }
    }

    // GraphQL user: `rest_id` with the screen name nested under legacy/core.
    if (typeof obj.rest_id === 'string') {
      const nested = obj.legacy?.screen_name ?? obj.core?.screen_name;
      if (typeof nested === 'string') {
        found = addUser(obj.rest_id, nested, obj.legacy?.name ?? obj.core?.name) || found;
      }
    }

    for (const key of Object.keys(obj)) {
      visit(obj[key]);
    }
  };
  visit(node);
  return found;
}

// https://twitter.com/i/api/1.1/dm/inbox_initial_state.json
// https://twitter.com/i/api/1.1/dm/inbox_timeline/trusted.json
// https://twitter.com/i/api/1.1/dm/conversation/{uid}-{uid}.json  # ONE_TO_ONE
// https://twitter.com/i/api/1.1/dm/conversation/{cid}.json        # GROUP_DM
export const DirectMessagesInterceptor: Interceptor = (req, res) => {
  // Harvest user profiles from ANY response (not just DM endpoints) so that
  // encrypted-DM senders, which only have numeric ids, can show @screen_names.
  let responseText = '';
  try {
    responseText = res.responseText;
  } catch {
    // Non-text responses (blob/arraybuffer) throw on .responseText; skip them.
  }
  if (responseText.includes('"screen_name"')) {
    try {
      if (harvestUsers(JSON.parse(responseText))) {
        messagesSignal.value = [...messagesSignal.value];
      }
    } catch {
      // Not JSON / unexpected shape; ignore.
    }
  }

  const strategy = strategies.find((s) => s.test(req.url));

  if (!strategy) {
    return;
  }

  try {
    const json = JSON.parse(res.responseText);
    const { entries, conversations, users } = strategy.parse(json);
    const messages = entries.map((entry) => entry.message).filter((message) => !!message);

    messagesSignal.value = [...messagesSignal.value, ...messages];
    persistMessages(messages);
    conversations.filter(Boolean).forEach((c) => conversationsCollection.set(c.conversation_id, c));
    users.filter(Boolean).forEach((user) => usersCollection.set(user.id_str, user));

    logger.info(`DirectMessages: ${messages.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('DirectMessages: Failed to parse API response', err as Error);
  }
};
