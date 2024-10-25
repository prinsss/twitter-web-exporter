import { EntityURL } from './index';
import { User } from './user';

export interface TimelineTweet {
  itemType: 'TimelineTweet';
  __typename: 'TimelineTweet';
  tweet_results: {
    // In rare cases, for example when a tweet has its visibility limited by Twitter,
    // this field may not be present.
    result?: TweetUnion;
  };
  tweetDisplayType: 'Tweet' | 'SelfThread' | 'MediaGrid';
  hasModeratedReplies?: boolean;
  socialContext?: unknown;
  highlights?: {
    textHighlights: Array<{
      startIndex: number;
      endIndex: number;
    }>;
  };
}

export type TweetUnion = Tweet | TweetWithVisibilityResults | TweetTombstone | TweetUnavailable;

export interface TweetWithVisibilityResults {
  __typename: 'TweetWithVisibilityResults';
  limitedActionResults: {
    limited_actions: {
      action: string;
      prompt: unknown;
    }[];
  };
  tweet: Tweet;
}

// Deleted tweets or tweets from protected accounts.
// See: https://github.com/JustAnotherArchivist/snscrape/issues/392
export interface TweetTombstone {
  __typename: 'TweetTombstone';
  tombstone: {
    __typename: 'TextTombstone';
    text: {
      rtl: boolean;
      // "You’re unable to view this Post because this account owner limits who can view their Posts. Learn more"
      // "This Post is from an account that no longer exists. Learn more"
      // "This Post is from a suspended account. Learn more"
      // "This Post was deleted by the Post author. Learn more"
      text: string;
      entities: unknown[];
    };
  };
}

// Tweets that are unavailable for some reason. Maybe NSFW.
// See: https://github.com/JustAnotherArchivist/snscrape/issues/433
export interface TweetUnavailable {
  __typename: 'TweetUnavailable';
}

export interface Tweet {
  __typename: 'Tweet';
  rest_id: string;
  core: {
    user_results: {
      result: User;
    };
  };
  has_birdwatch_notes?: boolean;
  // Usually used by advertisers.
  card?: unknown;
  unified_card?: unknown;
  edit_control: {
    edit_tweet_ids: string[];
    editable_until_msecs: string;
    is_edit_eligible: boolean;
    edits_remaining: string;
  };
  is_translatable: boolean;
  quoted_status_result?: {
    result: TweetUnion;
  };
  quotedRefResult?: {
    result: Partial<TweetUnion>;
  };
  views: {
    count?: string;
    state: 'Enabled' | 'EnabledWithCount';
  };
  source: string;
  // Used for long tweets.
  note_tweet?: {
    is_expandable: boolean;
    note_tweet_results: {
      result: NoteTweet;
    };
  };
  legacy: {
    bookmark_count: number;
    bookmarked: boolean;
    created_at: string;
    conversation_control?: unknown;
    conversation_id_str: string;
    display_text_range: number[];
    entities: TweetEntities;
    extended_entities?: TweetExtendedEntities;
    favorite_count: number;
    favorited: boolean;
    full_text: string;
    in_reply_to_screen_name?: string;
    in_reply_to_status_id_str?: string;
    in_reply_to_user_id_str?: string;
    is_quote_status: boolean;
    lang: string;
    limited_actions?: string;
    possibly_sensitive: boolean;
    possibly_sensitive_editable: boolean;
    quote_count: number;
    quoted_status_id_str?: string;
    quoted_status_permalink?: {
      url: string;
      expanded: string;
      display: string;
    };
    reply_count: number;
    retweet_count: number;
    retweeted: boolean;
    scopes?: unknown;
    user_id_str: string;
    id_str: string;
    retweeted_status_result?: {
      result: TweetUnion;
    };
  };
  /**
   * Some extra properties added by the script when inserting to local database.
   * These are not present in the original tweet object and are used for internal purposes only.
   */
  twe_private_fields: {
    /** The UNIX timestamp representation of `legacy.created_at` in milliseconds. */
    created_at: number;
    /** The UNIX timestamp in ms when inserted or updated to local database. */
    updated_at: number;
    /** The number of media items in the tweet. */
    media_count: number;
  };
}

export interface RichTextTag {
  from_index: number;
  to_index: number;
  richtext_types: ('Bold' | 'Italic')[];
}

export interface NoteTweet {
  id: string;
  text: string;
  entity_set: TweetEntities;
  richtext: {
    richtext_tags: RichTextTag[];
  };
  media: {
    inline_media: unknown[];
  };
}

export interface TweetEntities {
  media?: Media[];
  user_mentions: UserMention[];
  urls: EntityURL[];
  hashtags: Hashtag[];
  symbols: unknown[];
}

export interface Hashtag {
  indices: number[];
  text: string;
}

export interface Media {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_url_https: string;
  type: 'video' | 'photo' | 'animated_gif';
  additional_media_info?: {
    title: string;
    description: string;
  };
  mediaStats?: {
    viewCount: number;
  };
  url: string;
  features: {
    large: Feature;
    medium: Feature;
    small: Feature;
    orig: Feature;
  };
  sizes: {
    large: Size;
    medium: Size;
    small: Size;
    thumb: Size;
  };
  original_info: {
    height: number;
    width: number;
    focus_rects?: FocusRect[];
  };
  video_info?: {
    aspect_ratio: number[];
    duration_millis: number;
    variants: Variant[];
  };
  ext_alt_text?: string;
  media_key?: string;
  ext_media_availability?: {
    status: string;
  };
}

export interface Variant {
  bitrate?: number;
  content_type: string;
  url: string;
}

interface Feature {
  faces: FocusRect[];
}

interface FocusRect {
  x: number;
  y: number;
  h: number;
  w: number;
}

interface Size {
  h: number;
  w: number;
  resize: string;
}

interface UserMention {
  id_str: string;
  name: string;
  screen_name: string;
  indices: number[];
}

export interface TweetExtendedEntities {
  media: Media[];
}
