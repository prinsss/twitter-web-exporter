import { EntityURL } from './index';

export interface TimelineUser {
  itemType: 'TimelineUser';
  __typename: 'TimelineUser';
  user_results: {
    result: User | UserUnavailable;
  };
  userDisplayType: string;
}

export interface UserUnavailable {
  __typename: 'UserUnavailable';
  message: string;
  reason: string;
}

export interface User {
  __typename: 'User';
  id: string;
  rest_id: string;
  affiliates_highlighted_label: unknown;
  has_graduated_access: boolean;
  is_blue_verified: boolean;
  profile_image_shape: 'Square' | 'Circle';
  legacy: {
    default_profile: boolean;
    default_profile_image: boolean;
    description: string;
    entities: UserEntities;
    fast_followers_count: number;
    favourites_count: number;
    followers_count: number;
    friends_count: number;
    has_custom_timelines: boolean;
    is_translator: boolean;
    listed_count: number;
    media_count: number;
    normal_followers_count: number;
    pinned_tweet_ids_str: string[];
    possibly_sensitive: boolean;
    profile_banner_url?: string;
    profile_interstitial_type: string;
    statuses_count: number;
    translator_type: string;
    url?: string;
    want_retweets: boolean;
    withheld_in_countries: unknown[];
  };
  avatar: {
    image_url: string;
  };
  core: {
    created_at: string;
    name: string;
    screen_name: string;
  };
  dm_permissions: {
    can_dm: boolean;
  };
  location: {
    location: string;
  };
  media_permissions: {
    can_media_tag: boolean;
  };
  privacy: {
    protected?: boolean;
  };
  verification: {
    verified: boolean;
    verified_type?: 'Business' | 'Government' | string;
  };
  relationship_perspectives: {
    following: boolean;
    followed_by?: boolean;
    blocking?: boolean;
    muting?: boolean;
  };
  // The fields above are originally present in `legacy` but are now moved to the top level.
  parody_commentary_fan_label?: 'None' | 'Parody' | 'Commentary' | 'Fan';
  tipjar_settings?: {
    is_enabled?: boolean;
    patreon_handle?: string;
  };
  is_profile_translatable?: boolean;
  has_hidden_subscriptions_on_profile?: boolean;
  verification_info?: VerificationInfo;
  highlights_info?: {
    can_highlight_tweets: boolean;
    highlighted_tweets: string;
  };
  user_seed_tweet_count?: number;
  premium_gifting_eligible?: boolean;
  business_account?: unknown;
  creator_subscriptions_count?: number;
  legacy_extended_profile?: {
    birthdate?: {
      day: number;
      month: number;
      year?: number;
      visibility: string;
      year_visibility: string;
    };
  };
  professional?: {
    rest_id: string;
    professional_type: string;
    category: {
      id: number;
      name: string;
      icon_name: string;
    }[];
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
    /** The UNIX timestamp in ms when the data record was migrated from legacy format. */
    migrated_at?: number;
  };
}

/**
 * The user type definition prior to the Twitter API's breaking changes introduced in June 2025.
 * Used for compatibility with existing legacy data and database migrations.
 */
export interface UserLegacy extends User {
  legacy: User['legacy'] & {
    followed_by: boolean;
    following: boolean;
    can_dm: boolean;
    can_media_tag: boolean;
    created_at: string;
    location: string;
    name: string;
    profile_image_url_https: string;
    protected?: boolean;
    screen_name: string;
    verified: boolean;
    verified_type?: string;
  };
}

export interface UserEntities {
  description: {
    urls: EntityURL[];
  };
  url?: {
    urls: EntityURL[];
  };
}

export interface VerificationInfo {
  is_identity_verified: boolean;
  reason: {
    description: {
      text: string;
      entities: {
        from_index: number;
        to_index: number;
        ref: {
          url: string;
          url_type: 'ExternalUrl';
        };
      }[];
    };
    verified_since_msec: string;
  };
}
