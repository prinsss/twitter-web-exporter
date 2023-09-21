import {
  TimelineAddEntriesInstruction,
  TimelineEntry,
  TimelineInstructions,
  TimelineTimelineItem,
  TimelineTweet,
  TimelineUser,
  Tweet,
  User,
} from '@/types';
import logger from './logger';

/**
 * A generic function to extract data from the API response.
 *
 * @param response The XHR object.
 * @param extractInstructionsFromJson Get "TimelineAddEntries" instructions from the JSON object.
 * @param extractDataFromTimelineEntry Get user/tweet data from the timeline entry.
 * @param onNewDataReceived Returns the extracted data.
 */
export function extractDataFromResponse<
  R = unknown,
  T = User | Tweet,
  P = T extends User ? TimelineUser : TimelineTweet,
>(
  response: XMLHttpRequest,
  extractInstructionsFromJson: (json: R) => TimelineInstructions,
  extractDataFromTimelineEntry: (entry: TimelineEntry<TimelineTimelineItem<P>>) => T,
  onNewDataReceived: (newData: T[]) => void,
) {
  try {
    const json: R = JSON.parse(response.responseText);
    const instructions = extractInstructionsFromJson(json);

    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<P>;

    const newData: T[] = [];

    for (const entry of timelineAddEntriesInstruction.entries) {
      if (entry.content.entryType === 'TimelineTimelineItem') {
        newData.push(extractDataFromTimelineEntry(entry as TimelineEntry<TimelineTimelineItem<P>>));
      }
    }

    onNewDataReceived(newData);
  } catch (err) {
    logger.errorWithBanner('Failed to parse API response.', err as Error);
  }
}
