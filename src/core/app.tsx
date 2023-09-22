import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { cx } from '@/utils';
import { CatButton, CloseButton } from '@/components/buttons';
import extensionManager, { Extension } from './extensions';
import { DEFAULT_THEME, Settings } from './settings';
import { options } from './storage';
import logger from '@/utils/logger';

export function App() {
  const extensions = useSignal<Extension[]>([]);
  const currentTheme = useSignal(options.get('theme', DEFAULT_THEME));
  const showControlPanel = useSignal(options.get('showControlPanel', false));

  // Remember the last state of the control panel.
  const toggleControlPanel = () => {
    showControlPanel.value = !showControlPanel.value;
    options.set('showControlPanel', showControlPanel.value);
  };

  // Update UI when extensions or options change.
  useEffect(() => {
    extensionManager.signal.subscribe(() => {
      extensions.value = extensionManager.getExtensions();
    });

    options.signal.subscribe(() => {
      currentTheme.value = options.get('theme', DEFAULT_THEME);
    });

    logger.debug('App useEffect executed.');
  }, []);

  return (
    <Fragment>
      {/* To show and hide the main UI. */}
      <CatButton
        class="fixed top-[60%] left-[-20px] bg-transparent"
        onClick={toggleControlPanel}
        data-theme={currentTheme.value}
      />
      {/* The main UI block. */}
      <section
        data-theme={currentTheme.value}
        class={cx(
          'card card-compact bg-base-100 fixed border shadow-xl w-80 leading-loose text-base-content px-4 py-3 rounded-box border-solid border-neutral-content border-opacity-50 left-8 top-8 transition-transform duration-500',
          showControlPanel.value ? 'translate-x-0 transform-none' : 'translate-x-[-500px]',
        )}
      >
        {/* Card title. */}
        <header class="flex items-center h-9">
          <h2 class="font-semibold leading-none text-xl m-0 flex-grow">Web Exporter (α)</h2>
          <Settings />
          <CloseButton class="mr-[-5px]" onClick={toggleControlPanel} />
        </header>
        <p class="text-sm text-base-content text-opacity-70 mt-1 mb-2 leading-none">
          Refresh or clear to start new captures.
        </p>
        <div class="divider mt-0 mb-0"></div>
        {/* Extensions UI. */}
        <main>
          {extensions.value.map((ext) => {
            const Component = ext.render();
            if (ext.enabled && Component) {
              return <Component key={ext.name} />;
            }
            return null;
          })}
        </main>
      </section>
    </Fragment>
  );
}
