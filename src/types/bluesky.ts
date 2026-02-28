export interface BlueskyAuthor {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  createdAt?: string;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    following?: string;
    followedBy?: string;
  };
  labels?: unknown[];
  verification?: unknown;
}

export interface BlueskyImageView {
  thumb: string;
  fullsize: string;
  alt?: string;
  aspectRatio?: { width: number; height: number };
}

export interface BlueskyImageEmbed {
  $type: 'app.bsky.embed.images#view';
  images: BlueskyImageView[];
}

export interface BlueskyVideoEmbed {
  $type: 'app.bsky.embed.video#view';
  cid?: string;
  playlist?: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
}

export interface BlueskyExternalEmbed {
  $type: 'app.bsky.embed.external#view';
  external: {
    uri: string;
    title?: string;
    description?: string;
    thumb?: string;
  };
}

export interface BlueskyRecordEmbed {
  $type: 'app.bsky.embed.record#view';
  record: unknown;
}

export type BlueskyEmbedView =
  | BlueskyImageEmbed
  | BlueskyVideoEmbed
  | BlueskyExternalEmbed
  | BlueskyRecordEmbed;

export interface BlueskyReasonPin {
  $type: 'app.bsky.feed.defs#reasonPin';
}

export interface BlueskyReasonRepost {
  $type: 'app.bsky.feed.defs#reasonRepost';
  by: BlueskyAuthor;
  indexedAt: string;
}

export type BlueskyReason = BlueskyReasonPin | BlueskyReasonRepost;

export interface BlueskyPost {
  /** Primary key: at://did:plc:.../app.bsky.feed.post/<rkey> */
  uri: string;
  cid: string;
  author: BlueskyAuthor;
  record: {
    $type: string;
    createdAt: string;
    text: string;
    embed?: unknown;
    langs?: string[];
    reply?: {
      root: unknown;
      parent: unknown;
    };
  };
  embed?: BlueskyEmbedView;
  reason?: BlueskyReason;
  bookmarkCount: number;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: string;
  viewer?: {
    bookmarked?: boolean;
    threadMuted?: boolean;
    embeddingDisabled?: boolean;
  };
  labels?: unknown[];
  twe_private_fields: {
    created_at: number;
    updated_at: number;
  };
}
