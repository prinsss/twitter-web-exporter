import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
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

// https://twitter.com/i/api/1.1/dm/inbox_initial_state.json
// https://twitter.com/i/api/1.1/dm/inbox_timeline/trusted.json
// https://twitter.com/i/api/1.1/dm/conversation/{uid}-{uid}.json  # ONE_TO_ONE
// https://twitter.com/i/api/1.1/dm/conversation/{cid}.json        # GROUP_DM
export const DirectMessagesInterceptor: Interceptor = (req, res) => {
  const strategy = strategies.find((s) => s.test(req.url));

  if (!strategy) {
    return;
  }

  try {
    const json = JSON.parse(res.responseText);
    const { entries, conversations, users } = strategy.parse(json);
    const messages = entries.map((entry) => entry.message).filter((message) => !!message);

    messagesSignal.value = [...messagesSignal.value, ...messages];
    conversations.filter(Boolean).forEach((c) => conversationsCollection.set(c.conversation_id, c));
    users.filter(Boolean).forEach((user) => usersCollection.set(user.id_str, user));

    logger.info(`DirectMessages: ${messages.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('DirectMessages: Failed to parse API response', err as Error);
  }
};
