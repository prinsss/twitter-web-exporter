import { User } from './user';

export interface TimelineTwitterList {
  __typename: 'TimelineTwitterList';
  itemType: 'TimelineTwitterList';
  displayType: 'ListWithSubscribe';
  list: List;
}

export interface List {
  created_at: number;
  default_banner_media: {
    media_info: MediaInfo;
  };
  default_banner_media_results: {
    result: {
      id: string;
      media_key: string;
      media_id: string;
      media_info: MediaInfo;
      __typename: 'ApiMedia';
    };
  };
  description: string;
  facepile_urls: string[];
  followers_context: string;
  following: boolean;
  id: string;
  id_str: string;
  is_member: boolean;
  member_count: number;
  members_context: string;
  mode: 'Public' | 'Private';
  muting: boolean;
  name: string;
  pinning: boolean;
  subscriber_count: number;
  user_results: {
    result: User;
  };
}

interface MediaInfo {
  __typename?: 'ApiImage';
  original_img_height: number;
  original_img_width: number;
  original_img_url: string;
  salient_rect: SalientRect;
}

interface SalientRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
