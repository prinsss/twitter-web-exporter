import { unsafeWindow } from '$';
import Dexie, { KeyPaths } from 'dexie';
import { exportDB, importInto } from 'dexie-export-import';

import packageJson from '@/../package.json';
import { BlueskyPost, Capture, Tweet, User, WithSortIndex } from '@/types';
import { compareSortIndex, extractTweetMedia } from '@/utils/api';
import { parseTwitterDateTime } from '@/utils/common';
import { migration_20250609 } from '@/utils/migration';
import logger from '@/utils/logger';
import { ExtensionType } from '../extensions';
import { options } from '../options';

const DB_NAME = packageJson.name;
const DB_VERSION = 4;

declare global {
  interface Window {
    __META_DATA__: {
      userId: string;
      userHash: string;
    };
  }
}

export class DatabaseManager {
  private db: Dexie;

  constructor() {
    const globalObject = unsafeWindow ?? window ?? globalThis;
    const userId = globalObject.__META_DATA__?.userId ?? 'unknown';
    const suffix = options.get('dedicatedDbForAccounts') ? `_${userId}` : '';
    logger.debug(`Using database: ${DB_NAME}${suffix} for userId: ${userId}`);

    this.db = new Dexie(`${DB_NAME}${suffix}`);
    this.init();
  }

  /*
  |--------------------------------------------------------------------------
  | Type-Safe Table Accessors
  |--------------------------------------------------------------------------
  */

  private tweets() {
    return this.db.table<Tweet>('tweets');
  }

  private users() {
    return this.db.table<User>('users');
  }

  private captures() {
    return this.db.table<Capture>('captures');
  }

  private blueskyPosts() {
    return this.db.table<BlueskyPost>('bluesky_posts');
  }

  /*
  |--------------------------------------------------------------------------
  | Read Methods for Extensions
  |--------------------------------------------------------------------------
  */

  async extGetCaptures(extName: string) {
    return this.captures().where('extension').equals(extName).toArray().catch(this.logError);
  }

  async extGetCaptureCount(extName: string) {
    return this.captures().where('extension').equals(extName).count().catch(this.logError);
  }

  async extGetCapturedTweets(extName: string) {
    const captures = await this.extGetCaptures(extName);
    if (!captures) {
      return [];
    }

    const tweetIds = this.sortCaptures(captures).map((capture) => capture.data_key);
    const tweets = await this.tweets()
      .where('rest_id')
      .anyOf(tweetIds)
      .filter((t) => this.filterEmptyData(t))
      .toArray()
      .catch(this.logError);
    if (!tweets) {
      return [];
    }

    // Sort again based on capture order since IndexDB query with "anyOf" does not obey that order.
    const map = new Map(tweets.map((t) => [t.rest_id, t]));
    return tweetIds.map((id) => map.get(id)).filter((t): t is Tweet => !!t);
  }

  async extGetCapturedUsers(extName: string) {
    const captures = await this.extGetCaptures(extName);
    if (!captures) {
      return [];
    }

    const userIds = this.sortCaptures(captures).map((capture) => capture.data_key);
    const users = await this.users()
      .where('rest_id')
      .anyOf(userIds)
      .filter((u) => this.filterEmptyData(u))
      .toArray()
      .catch(this.logError);
    if (!users) {
      return [];
    }

    // Sort again based on capture order since IndexDB query with "anyOf" does not obey that order.
    const map = new Map(users.map((u) => [u.rest_id, u]));
    return userIds.map((id) => map.get(id)).filter((u): u is User => !!u);
  }

  async extGetCapturedBlueskyPosts(extName: string) {
    const captures = await this.extGetCaptures(extName);
    if (!captures) {
      return [];
    }

    const uris = this.sortCaptures(captures).map((capture) => capture.data_key);
    const posts = await this.blueskyPosts()
      .where('uri')
      .anyOf(uris)
      .filter((p) => !!p?.uri)
      .toArray()
      .catch(this.logError);
    if (!posts) {
      return [];
    }

    // Sort again based on capture order since IndexDB query with "anyOf" does not obey that order.
    const map = new Map(posts.map((p) => [p.uri, p]));
    return uris.map((uri) => map.get(uri)).filter((p): p is BlueskyPost => !!p);
  }

  /*
  |--------------------------------------------------------------------------
  | Write Methods for Extensions
  |--------------------------------------------------------------------------
  */

  async extAddTweets(extName: string, items: WithSortIndex<Tweet>[]) {
    const sorted = this.sortItems(items);
    await this.upsertTweets(sorted.map((item) => item.data));
    await this.upsertCaptures(
      sorted.map((item, i) => ({
        id: `${extName}-${item.data.rest_id}`,
        extension: extName,
        type: ExtensionType.TWEET,
        data_key: item.data.rest_id,
        // Here we add a small increment to make sure that the original order is preserved
        // when falling back to created_at sorting in case of missing sortIndex.
        created_at: Date.now() + i,
        sort_index: item.sortIndex,
      })),
    );
  }

  async extAddUsers(extName: string, items: WithSortIndex<User>[]) {
    const sorted = this.sortItems(items);
    await this.upsertUsers(sorted.map((item) => item.data));
    await this.upsertCaptures(
      sorted.map((item, i) => ({
        id: `${extName}-${item.data.rest_id}`,
        extension: extName,
        type: ExtensionType.USER,
        data_key: item.data.rest_id,
        created_at: Date.now() + i,
        sort_index: item.sortIndex,
      })),
    );
  }

  async extAddBlueskyPosts(extName: string, items: WithSortIndex<BlueskyPost>[]) {
    const sorted = this.sortItems(items);
    await this.upsertBlueskyPosts(sorted.map((item) => item.data));
    await this.upsertCaptures(
      sorted.map((item, i) => ({
        id: `${extName}-${item.data.uri}`,
        extension: extName,
        type: ExtensionType.BLUESKY_POST,
        data_key: item.data.uri,
        created_at: Date.now() + i,
        sort_index: item.sortIndex,
      })),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Methods for Extensions
  |--------------------------------------------------------------------------
  */

  async extClearCaptures(extName: string) {
    const captures = await this.extGetCaptures(extName);
    if (!captures) {
      return;
    }
    return this.captures().bulkDelete(captures.map((capture) => capture.id));
  }

  /*
  |--------------------------------------------------------------------------
  | Export and Import Methods
  |--------------------------------------------------------------------------
  */

  async export() {
    return exportDB(this.db).catch(this.logError);
  }

  async import(data: Blob) {
    return importInto(this.db, data).catch(this.logError);
  }

  async clear() {
    await this.deleteAllCaptures();
    await this.deleteAllTweets();
    await this.deleteAllUsers();
    await this.deleteAllBlueskyPosts();
    logger.info('Database cleared');
  }

  async count() {
    try {
      return {
        tweets: await this.tweets().count(),
        users: await this.users().count(),
        captures: await this.captures().count(),
        bluesky_posts: await this.blueskyPosts().count(),
      };
    } catch (error) {
      this.logError(error);
      return null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Common Methods
  |--------------------------------------------------------------------------
  */

  async upsertTweets(tweets: Tweet[]) {
    return this.db
      .transaction('rw', this.tweets(), () => {
        const data: Tweet[] = tweets.map((tweet) => ({
          ...tweet,
          twe_private_fields: {
            created_at: +parseTwitterDateTime(tweet.legacy?.created_at),
            updated_at: Date.now(),
            media_count: extractTweetMedia(tweet).length,
          },
        }));

        return this.tweets().bulkPut(data);
      })
      .catch(this.logError);
  }

  async upsertUsers(users: User[]) {
    return this.db
      .transaction('rw', this.users(), () => {
        const data: User[] = users.map((user) => ({
          ...user,
          twe_private_fields: {
            created_at: +parseTwitterDateTime(user.core?.created_at),
            updated_at: Date.now(),
          },
        }));

        return this.users().bulkPut(data);
      })
      .catch(this.logError);
  }

  async upsertCaptures(captures: Capture[]) {
    return this.db
      .transaction('rw', this.captures(), () => {
        return this.captures().bulkPut(captures).catch(this.logError);
      })
      .catch(this.logError);
  }

  async upsertBlueskyPosts(posts: BlueskyPost[]) {
    return this.db
      .transaction('rw', this.blueskyPosts(), () => {
        const data: BlueskyPost[] = posts.map((post) => ({
          ...post,
          twe_private_fields: {
            created_at: new Date(post.record.createdAt).getTime(),
            updated_at: Date.now(),
          },
        }));

        return this.blueskyPosts().bulkPut(data);
      })
      .catch(this.logError);
  }

  async deleteAllTweets() {
    return this.tweets().clear().catch(this.logError);
  }

  async deleteAllUsers() {
    return this.users().clear().catch(this.logError);
  }

  async deleteAllCaptures() {
    return this.captures().clear().catch(this.logError);
  }

  async deleteAllBlueskyPosts() {
    return this.blueskyPosts().clear().catch(this.logError);
  }

  private filterEmptyData(data: Tweet | User) {
    if (!data?.legacy) {
      logger.warn('Empty data found in DB', data);
      return false;
    }
    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Migrations
  |--------------------------------------------------------------------------
  */

  async init() {
    // Indexes for the "tweets" table.
    const tweetIndexPaths: KeyPaths<Tweet>[] = [
      'rest_id',
      'twe_private_fields.created_at',
      'twe_private_fields.updated_at',
      'twe_private_fields.media_count',
      'core.user_results.result.core.screen_name',
      'legacy.favorite_count',
      'legacy.retweet_count',
      'legacy.bookmark_count',
      'legacy.quote_count',
      'legacy.reply_count',
      'views.count',
      'legacy.favorited',
      'legacy.retweeted',
      'legacy.bookmarked',
    ];

    // Indexes for the "users" table.
    const userIndexPaths: KeyPaths<User>[] = [
      'rest_id',
      'twe_private_fields.created_at',
      'twe_private_fields.updated_at',
      'core.screen_name',
      'legacy.followers_count',
      'legacy.friends_count',
      'legacy.statuses_count',
      'legacy.favourites_count',
      'legacy.listed_count',
      'verification.verified_type',
      'is_blue_verified',
      'relationship_perspectives.following',
      'relationship_perspectives.followed_by',
    ];

    // Indexes for the "captures" table.
    const captureIndexPaths: KeyPaths<Capture>[] = [
      'id',
      'extension',
      'type',
      'created_at',
      'sort_index',
    ];

    // Indexes for the "bluesky_posts" table.
    const blueskyPostIndexPaths: string[] = [
      'uri',
      'twe_private_fields.created_at',
      'twe_private_fields.updated_at',
      'author.handle',
      'author.did',
      'likeCount',
      'repostCount',
      'replyCount',
      'quoteCount',
      'bookmarkCount',
    ];

    // Take care of database schemas and versioning.
    // See: https://dexie.org/docs/Tutorial/Design#database-versioning
    try {
      // Per Dexie docs, a version with an upgrader attached must never be altered.
      // You need to keep versions that have an upgrader as long as there are code out there
      // that use a version lower than the upgrader-attached version.
      this.db
        .version(2)
        .stores({
          tweets: tweetIndexPaths.join(','),
          users: userIndexPaths.join(','),
          captures: 'id,extension,type,created_at',
        })
        .upgrade(async (tx) => {
          logger.info('Upgrading database schema...');
          await migration_20250609(tx);
          logger.info('Database upgraded');
        });

      // v3: adds sort_index index to captures for timeline ordering.
      this.db.version(3).stores({
        tweets: tweetIndexPaths.join(','),
        users: userIndexPaths.join(','),
        captures: captureIndexPaths.join(','),
      });

      // v4: adds bluesky_posts table.
      this.db.version(DB_VERSION).stores({
        tweets: tweetIndexPaths.join(','),
        users: userIndexPaths.join(','),
        captures: captureIndexPaths.join(','),
        bluesky_posts: blueskyPostIndexPaths.join(','),
      });

      await this.db.open();
      logger.info(`Database connected: ${this.db.name}`);
    } catch (error) {
      this.logError(error);
    }
  }

  private sortItems<T>(items: WithSortIndex<T>[]): WithSortIndex<T>[] {
    return [...items].sort((a, b) => compareSortIndex(a.sortIndex, b.sortIndex));
  }

  private sortCaptures(captures: Capture[]): Capture[] {
    return [...captures].sort((a, b) => {
      if (a.sort_index && b.sort_index) return compareSortIndex(a.sort_index, b.sort_index);
      if (a.sort_index) return -1;
      if (b.sort_index) return 1;
      return b.created_at - a.created_at;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Loggers
  |--------------------------------------------------------------------------
  */

  logError(error: unknown) {
    logger.error(`Database Error: ${(error as Error).message}`, error);
  }
}
