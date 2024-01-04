import { TimelineTweet } from './tweet';
import { TimelineTwitterList } from './list';
import { TimelineUser } from './user';

export * from './list';
export * from './tweet';
export * from './user';

export interface EntityURL {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: number[];
}

export type TimelineInstructions = Array<
  | TimelineClearCacheInstruction
  | TimelineTerminateTimelineInstruction
  | TimelinePinEntryInstruction
  | TimelineAddEntriesInstruction
  | TimelineAddToModuleInstruction
>;

export interface TimelineClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface TimelineTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction: 'Top' | 'Bottom';
}

export interface TimelineEntry<
  T = ItemContentUnion,
  C = TimelineTimelineItem<T> | TimelineTimelineModule<T> | TimelineTimelineCursor,
> {
  content: C;
  entryId: string;
  sortIndex: string;
}

export interface TimelinePinEntryInstruction {
  type: 'TimelinePinEntry';
  entry: TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>>;
}

export interface TimelineAddEntriesInstruction<T = ItemContentUnion> {
  type: 'TimelineAddEntries';
  entries: TimelineEntry<T>[];
}

export interface TimelineAddToModuleInstruction<T = ItemContentUnion> {
  type: 'TimelineAddToModule';
  // "conversationthread-{id}"
  // "profile-grid-{id}"
  moduleEntryId: string;
  prepend: boolean;
  moduleItems: {
    // "conversationthread-{id}-tweet-{tid}"
    // "profile-grid-{id}-tweet-{tid}"
    entryId: string;
    item: {
      clientEventInfo: unknown;
      itemContent: T;
    };
  }[];
}

// TimelineEntry.entryId: "tweet-{id}"
// TimelineEntry.entryId: "user-{id}"
export interface TimelineTimelineItem<T = ItemContentUnion> {
  entryType: 'TimelineTimelineItem';
  __typename: 'TimelineTimelineItem';
  itemContent: T;
  clientEventInfo: unknown;
}

// TimelineEntry.entryId: "cursor-top-{id}"
// TimelineEntry.entryId: "cursor-bottom-{id}"
export interface TimelineTimelineCursor {
  entryType: 'TimelineTimelineCursor';
  __typename: 'TimelineTimelineCursor';
  value: string;
  cursorType: 'Top' | 'Bottom' | 'ShowMore' | 'ShowMoreThreads';
}

export interface TimelinePrompt {
  itemType: 'TimelinePrompt';
  __typename: 'TimelinePrompt';
}

export interface TimelineMessagePrompt {
  itemType: 'TimelineMessagePrompt';
  __typename: 'TimelineMessagePrompt';
}

export type ItemContentUnion =
  | TimelineTweet
  | TimelineUser
  | TimelinePrompt
  | TimelineMessagePrompt
  | TimelineTimelineCursor
  | TimelineTwitterList;

// TimelineEntry.entryId: "who-to-follow-{id}"
// TimelineEntry.entryId: "profile-conversation-{id}"
// TimelineEntry.entryId: "conversationthread-{id}"
// TimelineEntry.entryId: "tweetdetailrelatedtweets-{id}"
// TimelineEntry.entryId: "profile-grid-{id}"
// TimelineEntry.entryId: "search-grid-{id}"
// TimelineEntry.entryId: "list-search-{id}"
export interface TimelineTimelineModule<T = ItemContentUnion> {
  entryType: 'TimelineTimelineModule';
  __typename: 'TimelineTimelineModule';
  clientEventInfo: unknown;
  displayType:
    | 'Vertical'
    | 'VerticalConversation'
    | 'VerticalGrid'
    | 'ListWithPin'
    | 'ListWithSubscribe'
    | string;
  items: {
    // "who-to-follow-{id}-user-{uid}"
    // "profile-conversation-{id}-tweet-{tid}"
    // "conversationthread-{id}-tweet-{tid}"
    // "conversationthread-{id}-cursor-showmore-{cid}"
    // "tweetdetailrelatedtweets-{id}-tweet-{tid}"
    // "profile-grid-{id}-tweet-{tid}"
    // "search-grid-{id}-tweet-{tid}"
    // "list-search-{id}-list-{lid}"
    entryId: string;
    item: {
      clientEventInfo: unknown;
      feedbackInfo: unknown;
      itemContent: T;
    };
  }[];
  header?: unknown;
  metadata?: {
    conversationMetadata: {
      allTweetIds: string[];
      enableDeduplication: boolean;
    };
  };
}
