import { useSignal } from '@preact/signals';
import extensions from './extensions';

import './app.less';

export function App() {
  const showControlPanel = useSignal(true);

  if (!showControlPanel.value) {
    return null;
  }

  return (
    <div class="control-panel">
      <h2>Control Panel</h2>
      <div class="btn-group">
        <button onClick={() => (showControlPanel.value = false)}>DISMISS</button>
      </div>
      <div class="panels">
        {extensions.getPanels().map((Panel) => (
          <Panel />
        ))}
      </div>
    </div>
  );
}
