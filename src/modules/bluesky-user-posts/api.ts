import { db } from '@/core/database';
import { Interceptor } from '@/core/extensions';
import { BlueskyPost, BlueskyReason, WithSortIndex } from '@/types';
import logger from '@/utils/logger';

interface BlueskyAuthorFeedResponse {
  feed: Array<{
    post: BlueskyPost;
    reason?: BlueskyReason;
  }>;
  cursor?: string;
}

// https://maitake.us-west.host.bsky.network/xrpc/app.bsky.feed.getAuthorFeed
export const BlueskyUserPostsInterceptor: Interceptor = (req, res, ext) => {
  if (!req.url.includes('/xrpc/app.bsky.feed.getAuthorFeed')) {
    return;
  }

  try {
    const json: BlueskyAuthorFeedResponse = JSON.parse(res.responseText);
    const newData: WithSortIndex<BlueskyPost>[] = [];

    // See: https://docs.bsky.app/docs/advanced-guides/timestamps#sortat
    let index = json.feed.length;
    let cursor = json.cursor ? new Date(json.cursor).getTime() : Date.now();

    // When user has only a few posts, the cursor may be missing.
    if (isNaN(cursor)) {
      cursor = Date.now();
    }

    for (const item of json.feed) {
      const post = item.post;
      if (!post?.uri) {
        continue;
      }

      newData.push({ data: post, sortIndex: String(cursor + index) });
      index--;
    }

    db.extAddBlueskyPosts(ext.name, newData);
    logger.info(`BlueskyUserPosts: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('BlueskyUserPosts: Failed to parse API response', err as Error);
  }
};
