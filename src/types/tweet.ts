import { User } from './user';

export interface TimelineTweet {
  itemType: 'TimelineTweet';
  __typename: 'TimelineTweet';
  tweet_results: {
    result: TweetWithVisibilityResults | Tweet;
  };
  tweetDisplayType: string;
}

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

export interface Tweet {
  __typename: 'Tweet';
  rest_id: string;
  core: {
    user_results: {
      result: User;
    };
  };
  card?: unknown;
  unified_card?: unknown;
  edit_control: {
    edit_tweet_ids: string[];
    editable_until_msecs: string;
    is_edit_eligible: boolean;
    edits_remaining: string;
  };
  is_translatable: boolean;
  views: {
    count: string;
    state: string;
  };
  source: string;
  note_tweet?: unknown;
  legacy: {
    bookmark_count: number;
    bookmarked: boolean;
    created_at: string;
    conversation_control?: unknown;
    conversation_id_str: string;
    display_text_range: number[];
    entities: TweetEntities;
    extended_entities: TweetExtendedEntities;
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
    reply_count: number;
    retweet_count: number;
    retweeted: boolean;
    scopes?: unknown;
    user_id_str: string;
    id_str: string;
  };
}

interface TweetEntities {
  media?: Media[];
  user_mentions: UserMention[];
  urls: URL[];
  hashtags: Hashtag[];
  symbols: unknown[];
}

interface URL {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: number[];
}

interface Hashtag {
  indices: number[];
  text: string;
}

interface Media {
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

interface TweetExtendedEntities {
  media: Media[];
}
