import { TimelineTweet } from './tweet';
import { TimelineUser } from './user';

export * from './tweet';
export * from './user';

export type TimelineInstructions = Array<
  | TimelineClearCacheInstruction
  | TimelineTerminateTimelineInstruction
  | TimelinePinEntryInstruction
  | TimelineAddEntriesInstruction
>;

export interface TimelineClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface TimelineTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction: 'Top' | 'Bottom';
}

export interface TimelineEntry<T> {
  content: T;
  entryId: string;
  sortIndex: string;
}

export interface TimelinePinEntryInstruction {
  type: 'TimelinePinEntry';
  entry: TimelineEntry<TimelineTimelineItem<TimelineTweet>>;
}

export interface TimelineAddEntriesInstruction<T = TimelineTweet | TimelineUser> {
  type: 'TimelineAddEntries';
  entries: TimelineEntry<
    TimelineTimelineItem<T> | TimelineTimelineCursor | TimelineTimelineModule
  >[];
}

// entryId: "tweet-{id}"
// entryId: "user-{id}"
export interface TimelineTimelineItem<T> {
  entryType: 'TimelineTimelineItem';
  __typename: 'TimelineTimelineItem';
  itemContent: T;
  clientEventInfo: unknown;
}

// entryId: "cursor-top-{id}"
// entryId: "cursor-bottom-{id}"
export interface TimelineTimelineCursor {
  entryType: 'TimelineTimelineCursor';
  __typename: 'TimelineTimelineCursor';
  value: string;
  cursorType: 'Top' | 'Bottom';
}

// entryId: "who-to-follow-{id}"
// entryId: "profile-conversation-{id}"
export interface TimelineTimelineModule<T = TimelineTweet | TimelineUser> {
  entryType: 'TimelineTimelineModule';
  __typename: 'TimelineTimelineModule';
  clientEventInfo: unknown;
  displayType: 'Vertical' | 'VerticalConversation' | string;
  items: {
    // "who-to-follow-{id}-user-{uid}"
    // "profile-conversation-{id}-tweet-{tid}"
    entryId: string;
    item: {
      clientEventInfo: unknown;
      itemContent: T;
    };
  }[];
  metadata?: {
    conversationMetadata: {
      allTweetIds: string[];
      enableDeduplication: boolean;
    };
  };
}
