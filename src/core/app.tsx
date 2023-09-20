import { Fragment } from 'preact';
import extensions from './extensions';
import { CatButton, CloseButton } from '@/components/buttons';
import { useToggle } from '@/utils';
import { Logs } from '@/components/logs';
import { logLinesSignal } from '@/utils/logger';

export function App() {
  const [showControlPanel, toggleControlPanel] = useToggle();

  return (
    <Fragment>
      <CatButton class="btn-cat fixed top-[60%] left-[-20px]" onClick={toggleControlPanel} />
      {showControlPanel.value && (
        <section class="fixed bg-[#f7f9f9] border shadow-[rgba(0,0,0,0.08)_0px_8px_28px] w-[300px] leading-loose text-[#0f1419] px-[15px] py-2.5 rounded-2xl border-solid border-[#bfbfbf] left-[30px] top-[30px]">
          <header class="flex items-center justify-between h-9 mb-[5px]">
            <h2 class="leading-none text-xl m-0">Web Exporter (α)</h2>
            <CloseButton class="mr-[-5px]" onClick={toggleControlPanel} />
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
