import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { User } from '@/types';
import logger from '@/utils/logger';

interface UserAboutResponse {
  data: {
    user_result_by_screen_name: {
      id: string;
      result: Partial<User> & {
        __typename: 'User';
        rest_id: string;
      };
    };
  };
}

// https://twitter.com/i/api/graphql/zUnx-DLN9dkwOkNhTLySjg/AboutAccountQuery
export const UserAboutInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/AboutAccountQuery/.test(req.url)) {
    return;
  }

  try {
    const json: UserAboutResponse = JSON.parse(res.responseText);
    const result = json.data?.user_result_by_screen_name?.result;
    const newData = [{ data: result }];

    if (!result || result.__typename !== 'User' || !result.rest_id || !result.about_profile) {
      return;
    }

    // Update captured data to the database.
    db.extUpdateUsers(ext.name, newData);

    logger.info(`UserAbout: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('UserAbout: Failed to parse API response', err as Error);
  }
};
