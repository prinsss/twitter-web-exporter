import { Extension } from '@/core/extensions';
import { RuntimeLogsPanel } from '@/modules/runtime-logs/ui';

export default class RuntimeLogsModule extends Extension {
  name = 'RuntimeLogsModule';

  render() {
    return RuntimeLogsPanel;
  }
}
