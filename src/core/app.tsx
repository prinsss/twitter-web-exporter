import { Fragment } from 'preact';
import extensions from './extensions';
import { CatButton, CloseButton } from '@/components/buttons';
import { useToggle } from '@/utils';
import { Logs } from '@/components/logs';
import { logLinesSignal } from '@/utils/logger';

import './app.less';

export function App() {
  const [showControlPanel, toggleControlPanel] = useToggle();

  return (
    <Fragment>
      <CatButton class="btn-cat btn-open-panel" onClick={toggleControlPanel} />
      {showControlPanel.value && (
        <section class="control-panel">
          <header class="control-panel-header">
            <h2>Web Exporter (α)</h2>
            <CloseButton onClick={toggleControlPanel} />
          </header>
          <main>
            {extensions.getPanels().map((Panel) => (
              <Panel />
            ))}
          </main>
          <footer>
            <Logs lines={logLinesSignal} />
          </footer>
        </section>
      )}
    </Fragment>
  );
}
