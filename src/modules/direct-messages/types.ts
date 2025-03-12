import { Media, TweetEntities, TweetExtendedEntities, UserEntities } from '@/types';

export interface InboxInitialStateResponse {
  inbox_initial_state: DmTimeline;
}

export interface InboxTimelineTrustedResponse {
  inbox_timeline: DmTimeline<LegacyUserExtended> & {
    status: DmTimelineStatus;
    min_entry_id: string;
  };
}

export interface ConversationResponse {
  conversation_timeline: DmTimeline<LegacyUserExtended> & {
    status: DmTimelineStatus;
    min_entry_id: string;
    max_entry_id: string;
  };
}

type DmTimelineStatus = 'HAS_MORE' | 'AT_END';

interface DmTimeline<U = LegacyUser> {
  entries: DmEntry[];
  users: {
    [key: string]: U;
  };
  conversations: {
    [key: string]: Conversation;
  };
}

export interface DmEntry {
  message?: Message;
  conversation_create?: ConversationCreate;
  trust_conversation?: TrustConversation;
  join_conversation?: JoinConversation;
  participants_join?: ParticipantsJoin;
  participants_leave?: ParticipantsLeave;
}

export interface Message {
  id: string;
  time: string;
  affects_sort: boolean;
  request_id?: string;
  conversation_id: string;
  message_data: MessageData;
  message_reactions?: MessageReaction[];
}

interface MessageData {
  id: string;
  time: string;
  recipient_id?: string;
  sender_id: string;
  text: string;
  edit_count?: number;
  conversation_id?: string;
  entities?: TweetEntities;
  attachment?: {
    photo?: Media;
    video?: Media;
    animated_gif?: Media;
    card?: AttachmentCard;
    tweet?: AttachmentTweet;
  };
}

interface AttachmentCard {
  name: string;
  url: string;
  card_type_url: string;
  binding_values: unknown;
  users?: {
    [key: string]: LegacyUserExtended;
  };
}

interface AttachmentTweet {
  id: string;
  url: string;
  display_url: string;
  expanded_url: string;
  indices: number[];
  status: DmTweet;
}

interface MessageReaction {
  id: string;
  time: string;
  conversation_id: string;
  message_id: string;
  reaction_key: 'agree' | 'emoji';
  emoji_reaction?: string;
  sender_id: string;
}

interface ConversationCreate {
  id: string;
  time: string;
  conversation_id: string;
  request_id?: string;
}

interface TrustConversation {
  id: string;
  time: string;
  affects_sort: boolean;
  conversation_id: string;
  reason: string;
  request_id?: string;
}

interface JoinConversation {
  id: string;
  time: string;
  affects_sort: boolean;
  conversation_id: string;
  sender_id: string;
  participants: {
    user_id: string;
  }[];
}

interface ParticipantsJoin {
  id: string;
  time: string;
  affects_sort: boolean;
  conversation_id: string;
  sender_id: string;
  participants: {
    user_id: string;
    join_time: string;
  }[];
}

interface ParticipantsLeave {
  id: string;
  time: string;
  affects_sort: boolean;
  conversation_id: string;
  participants: {
    user_id: string;
  }[];
}

interface DmTweet {
  created_at: string;
  id: number;
  id_str: string;
  full_text: string;
  truncated: boolean;
  display_text_range: number[];
  entities: TweetEntities;
  extended_entities?: TweetExtendedEntities;
  source: string;
  in_reply_to_status_id: number | null;
  in_reply_to_status_id_str: string | null;
  in_reply_to_user_id: number | null;
  in_reply_to_user_id_str: string | null;
  in_reply_to_screen_name: string | null;
  user: LegacyUserExtended;
  geo: null;
  coordinates: null;
  place: null;
  contributors: null;
  is_quote_status: boolean;
  quoted_status_id?: number;
  quoted_status_id_str?: string;
  quoted_status_permalink?: {
    url: string;
    expanded: string;
    display: string;
  };
  retweet_count: number;
  favorite_count: number;
  reply_count: number;
  quote_count: number;
  favorited: boolean;
  retweeted: boolean;
  possibly_sensitive: boolean;
  possibly_sensitive_editable: boolean;
  lang: string;
  supplemental_language: null;
  self_thread?: {
    id: number;
    id_str: string;
  };
  ext: unknown;
}

export interface LegacyUser {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  profile_image_url: string;
  profile_image_url_https: string;
  following: boolean;
  follow_request_sent: boolean;
  description: string | null;
  entities: UserEntities;
  verified: boolean;
  is_blue_verified: boolean; // This is actually not present in LegacyUserExtended.
  protected: boolean;
  blocking: boolean;
  subscribed_by: boolean;
  can_media_tag: boolean;
  dm_blocked_by: boolean;
  dm_blocking: boolean;
  created_at: string;
  friends_count: number;
  followers_count: number;
}

interface LegacyUserExtended extends LegacyUser {
  location: string | null;
  url: string | null;
  listed_count: number;
  favourites_count: number;
  utc_offset: null;
  time_zone: null;
  geo_enabled: boolean;
  statuses_count: number;
  lang: null;
  contributors_enabled: boolean;
  is_translator: boolean;
  is_translation_enabled: boolean;
  profile_background_color: string;
  profile_background_image_url: string;
  profile_background_image_url_https: string;
  profile_background_tile: boolean;
  profile_banner_url: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: boolean;
  default_profile: boolean;
  default_profile_image: boolean;
  can_dm: null;
  can_secret_dm: null;
  notifications: boolean;
  blocked_by: boolean;
  want_retweets: boolean;
  business_profile_state: string;
  translator_type: string;
  withheld_in_countries: unknown[];
  followed_by: boolean;
  ext?: unknown;
}

export interface Conversation {
  conversation_id: string;
  type: 'ONE_TO_ONE' | 'GROUP_DM';
  sort_event_id: string;
  sort_timestamp: string;
  participants: {
    user_id: string;
    last_read_event_id?: string;
  }[];
  nsfw: boolean;
  notifications_disabled: boolean;
  mention_notifications_disabled: boolean;
  last_read_event_id: string;
  read_only: boolean;
  trusted: boolean;
  muted: boolean;
  status: DmTimelineStatus;
  min_entry_id: string;
  max_entry_id: string;
}
