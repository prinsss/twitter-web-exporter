import { GM_xmlhttpRequest } from '$';
import { options } from '@/core/options';
import { Media, Tweet } from '@/types';
import {
  extractQuotedTweet,
  extractRetweetedTweet,
  extractTweetFullText,
  extractTweetMedia,
  extractTweetUserScreenName,
  getFileExtensionFromUrl,
  getMediaOriginalUrl,
} from './api';
import { parseTwitterDateTime } from './common';
import { ProgressCallback } from './download';

/**
 * Integration with Meva (https://github.com/rimexe0/meva), a local-first media library.
 *
 * Media is handed to the Meva server via `POST /api/import/url`, the same endpoint and payload
 * shape the Meva browser extension uses, so the server downloads the file and writes the `.meva`
 * sidecar with identical metadata, folder layout and idempotency keys.
 */

export const DEFAULT_MEVA_SERVER_URL = 'http://localhost:3301';

export type MevaImportRequest = {
  url: string;
  preferredSubdir: string;
  preferredFilename: string;
  idempotencyKey: string;
  metadata: {
    title: string;
    description: string;
    source: {
      adapter: string;
      site: string;
      sourceKind: string;
      canonicalUrl: string;
      postUrl: string;
      mediaUrl: string;
      sourceId: string;
      authorId: string;
    };
    sourceMetadata: Record<string, unknown>;
    publishedAt?: string;
    width?: number;
    height?: number;
    tags: {
      original: string[];
    };
  };
};

const MEVA_MEDIA_TYPES: Record<Media['type'], string> = {
  photo: 'image',
  video: 'video',
  animated_gif: 'gif',
};

const sanitizeHandle = (handle: string) => handle.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

const sanitizeFilenameSegment = (value: string) => value.replace(/[^a-zA-Z0-9_.-]/g, '_');

const extractHashtags = (text: string) => (text.match(/#[\w]+/g) ?? []).map((tag) => tag.slice(1));

const getUserId = (tweet: Tweet) =>
  tweet.core?.user_results?.result?.rest_id ?? tweet.legacy?.user_id_str ?? '';

const getUserName = (tweet: Tweet) => tweet.core?.user_results?.result?.core?.name ?? '';

/**
 * Handle of the logged-in account. Meva groups Twitter imports as `twitter/<viewer>/<author>`.
 */
export function getViewerHandle(): string | undefined {
  const configured = options.get('mevaViewerHandle')?.trim().replace(/^@/, '');
  if (configured) {
    return configured;
  }

  const link = document.querySelector<HTMLAnchorElement>('a[data-testid="AppTabBar_Profile_Link"]');
  const handle = link?.getAttribute('href')?.split('/').filter(Boolean)[0];
  return handle || undefined;
}

/**
 * Build Meva import requests for all media in the given tweets.
 */
export function buildMevaImportRequests(
  tweets: Tweet[],
  includeRetweets: boolean,
  mediaTypes: readonly Media['type'][],
  viewerHandle?: string,
): MevaImportRequest[] {
  const requests = new Map<string, MevaImportRequest>();
  const viewer = viewerHandle ? sanitizeHandle(viewerHandle) : undefined;

  for (const item of tweets) {
    const retweeted = extractRetweetedTweet(item);
    if (retweeted && !includeRetweets) {
      continue;
    }

    // Retweets are stored under the original tweet and author, like the Meva extension does.
    const tweet = retweeted ?? item;
    const quoted = extractQuotedTweet(tweet);

    const postId = tweet.rest_id ?? tweet.legacy?.id_str;
    const authorHandle = extractTweetUserScreenName(tweet);
    const authorId = getUserId(tweet);
    const postText = extractTweetFullText(tweet) ?? '';
    const postUrl = `https://x.com/${authorHandle}/status/${postId}`;
    const createdAt = tweet.legacy?.created_at;
    const publishedAt = createdAt ? parseTwitterDateTime(createdAt).toISOString() : undefined;

    const author = sanitizeHandle(authorHandle || 'unknown');
    const preferredSubdir = viewer ? `twitter/${viewer}/${author}` : `twitter/${author}`;

    for (const media of extractTweetMedia(tweet)) {
      const mediaKey = media.media_key ?? media.id_str;
      if (!postId || !mediaKey || !mediaTypes.includes(media.type)) {
        continue;
      }

      const url = getMediaOriginalUrl(media);
      const ext = getFileExtensionFromUrl(url);
      const filename = [authorId, postId, mediaKey].map(sanitizeFilenameSegment).join('_');
      const preferredFilename = `${filename}.${ext}`;
      const idempotencyKey = `ext-twitter-${postId}-${mediaKey}`;

      // Prefer the original tweet's metadata when it was also captured directly.
      if (retweeted && requests.has(idempotencyKey)) {
        continue;
      }

      requests.set(idempotencyKey, {
        url,
        preferredSubdir,
        preferredFilename,
        idempotencyKey,
        metadata: {
          title: filename,
          description: postText,
          source: {
            adapter: 'twitter-extension',
            site: 'twitter',
            sourceKind: 'extension',
            canonicalUrl: postUrl,
            postUrl,
            mediaUrl: url,
            sourceId: postId,
            authorId,
          },
          sourceMetadata: {
            tweetId: postId,
            authorHandle,
            authorName: getUserName(tweet),
            authorUserId: authorId,
            ...(viewer ? { loggedInHandle: viewer } : {}),
            mediaKey,
            mediaType: MEVA_MEDIA_TYPES[media.type],
            ...(retweeted
              ? {
                  isRetweet: true,
                  retweetedByHandle: extractTweetUserScreenName(item),
                  retweetedByName: getUserName(item),
                }
              : {}),
            ...(quoted
              ? {
                  isQuote: true,
                  quotedAuthorHandle: extractTweetUserScreenName(quoted),
                  quotedAuthorName: getUserName(quoted),
                  quotedText: extractTweetFullText(quoted),
                }
              : {}),
          },
          publishedAt,
          width: media.original_info?.width,
          height: media.original_info?.height,
          tags: {
            original: extractHashtags(postText),
          },
        },
      });
    }
  }

  return Array.from(requests.values());
}

type MevaResponse = { status: number; text: string };

function getServerUrl() {
  const value = options.get('mevaServerUrl')?.trim() || DEFAULT_MEVA_SERVER_URL;
  return value.replace(/\/+$/, '');
}

/**
 * Twitter's CSP blocks direct requests to the Meva server, so go through the userscript manager.
 */
function mevaRequest(method: 'GET' | 'POST', path: string, body?: unknown) {
  const token = options.get('mevaAuthToken')?.trim();

  return new Promise<MevaResponse>((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url: `${getServerUrl()}${path}`,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      data: body ? JSON.stringify(body) : undefined,
      timeout: 15000,
      onload: (res) => resolve({ status: res.status, text: res.responseText }),
      onerror: () => reject(new Error(`Could not connect to Meva server at ${getServerUrl()}`)),
      ontimeout: () => reject(new Error(`Meva server at ${getServerUrl()} timed out`)),
    });
  });
}

export async function checkMevaStatus(): Promise<boolean> {
  try {
    const res = await mevaRequest('GET', '/api/status');
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

export async function importToMeva(request: MevaImportRequest) {
  const res = await mevaRequest('POST', '/api/import/url', request);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Meva import failed (${res.status}): ${res.text}`);
  }
}

/**
 * Queue all requests on the Meva server, one at a time. Failures do not stop the batch.
 */
export async function importAllToMeva(
  requests: MevaImportRequest[],
  onProgress?: ProgressCallback<MevaImportRequest>,
  onError?: (request: MevaImportRequest, error: Error) => void,
) {
  let current = 0;
  for (const request of requests) {
    try {
      await importToMeva(request);
      onProgress?.(++current, requests.length, request);
    } catch (err) {
      onError?.(request, err as Error);
      onProgress?.(++current, requests.length);
    }
  }
}
