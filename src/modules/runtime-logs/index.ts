import { Extension } from '@/core/extensions';
import { RuntimeLogsPanel } from '@/modules/runtime-logs/ui';
import logger from '@/utils/logger';

const RuntimeLogsModule: Extension = {
  name: 'runtime-logs',
  setup(ctx) {
    logger.debug('RuntimeLogsModule setup');

    ctx.registerPanel(RuntimeLogsPanel);
  },
};

export default RuntimeLogsModule;
