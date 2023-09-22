import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTweetWithVisibility } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "Bookmarks".
 */
export const bookmarksSignal = signal<Tweet[]>([]);

interface BookmarksResponse {
  data: {
    bookmark_timeline_v2: {
      timeline: {
        instructions: TimelineInstructions;
        responseObjects: unknown;
      };
    };
  };
}

// https://twitter.com/i/api/graphql/j5KExFXtSWj8HjRui17ydA/Bookmarks
export const BookmarksInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/Bookmarks/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<BookmarksResponse, Tweet>(
      res,
      (json) => json.data.bookmark_timeline_v2.timeline.instructions,
      (entry) => extractTweetWithVisibility(entry.content.itemContent),
    );

    // Add captured data to the global store.
    bookmarksSignal.value = [...bookmarksSignal.value, ...newData];

    logger.info(`Bookmarks: ${newData.length} items received`);
  } catch (err) {
    logger.errorWithBanner('Bookmarks: Failed to parse API response.', err as Error);
  }
};
