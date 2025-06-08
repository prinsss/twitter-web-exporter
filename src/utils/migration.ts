import { Tweet, User, UserLegacy } from '@/types';
import { Transaction } from 'dexie';
import logger from './logger';
import { extractQuotedTweet, extractRetweetedTweet } from './api';

export async function migration_20250609(tx: Transaction) {
  logger.info('Running migration_20250609: Migrating legacy user data format');

  let userCount = 0;
  await tx
    .table<User>('users')
    .toCollection()
    .modify((user) => {
      // Skip if it's already in the new format.
      if (user.core && user.avatar) {
        return;
      }

      migrateFromLegacyUser(user);
      logger.debug(`Migrated user: ${user.rest_id}`);

      user.twe_private_fields.migrated_at = Date.now();
      userCount++;
    });

  let tweetCount = 0;
  await tx
    .table<Tweet>('tweets')
    .toCollection()
    .modify((tweet) => {
      const user = tweet.core.user_results.result;

      // Skip if it's already in the new format.
      if (user.core && user.avatar) {
        return;
      }

      migrateFromLegacyUser(user);
      logger.debug(`Migrated tweet user: ${tweet.rest_id} `);

      const rtSource = extractRetweetedTweet(tweet);
      if (rtSource) {
        migrateFromLegacyUser(rtSource.core.user_results.result);
        logger.debug(`Migrated retweeted user: ${rtSource.rest_id}`);
      }

      const qtSource = extractQuotedTweet(tweet);
      if (qtSource) {
        migrateFromLegacyUser(qtSource.core.user_results.result);
        logger.debug(`Migrated quoted user: ${qtSource.rest_id}`);
      }

      tweet.twe_private_fields.migrated_at = Date.now();
      tweetCount++;
    });

  logger.info(`Migration completed: ${userCount} users and ${tweetCount} tweets updated.`);
}

export function migrateFromLegacyUser(user: User) {
  const ul = user as UserLegacy;

  // Modify in-place to avoid creating a new object.
  // See: https://dexie.org/docs/Collection/Collection.modify()
  user.core ??= {
    created_at: ul.legacy.created_at,
    name: ul.legacy.name,
    screen_name: ul.legacy.screen_name,
  };
  user.avatar ??= {
    image_url: ul.legacy.profile_image_url_https,
  };
  user.verification ??= {
    verified: ul.legacy.verified,
    verified_type: ul.legacy.verified_type,
  };
  user.relationship_perspectives ??= {
    following: ul.legacy.following,
    followed_by: ul.legacy.followed_by,
  };
  user.dm_permissions ??= {
    can_dm: ul.legacy.can_dm,
  };
  user.privacy ??= {
    protected: ul.legacy.protected,
  };
  user.location ??= {
    location: ul.legacy.location,
  };
}
