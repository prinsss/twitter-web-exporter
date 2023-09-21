import { Extension } from '@/core/extensions';
import { RuntimeLogsPanel } from '@/modules/runtime-logs/ui';

const RuntimeLogsModule: Extension = {
  name: 'RuntimeLogsModule',
  setup(ctx) {
    ctx.registerPanel(RuntimeLogsPanel);
  },
};

export default RuntimeLogsModule;
