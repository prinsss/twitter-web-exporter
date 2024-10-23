import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { User } from '@/types';
import logger from '@/utils/logger';

interface UserDetailResponse {
  data: {
    user: {
      result: User;
    };
  };
}

// https://twitter.com/i/api/graphql/BQ6xjFU6Mgm-WhEP3OiT9w/UserByScreenName
export const UserDetailInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/UserByScreenName/.test(req.url)) {
    return;
  }

  try {
    const json: UserDetailResponse = JSON.parse(res.responseText);
    const newData = [json.data.user.result];

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`UserDetail: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('UserDetail: Failed to parse API response', err as Error);
  }
};
