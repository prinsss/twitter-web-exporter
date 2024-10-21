import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconBrandTwitterFilled, IconX } from '@tabler/icons-preact';
import { GM_registerMenuCommand } from '$';

import { ErrorBoundary } from '@/components/error-boundary';
import { CatIcon } from '@/components/common';
import { useTranslation } from '@/i18n';
import { cx } from '@/utils/common';
import logger from '@/utils/logger';

import extensionManager, { Extension } from './extensions';
import { Settings } from './settings';
import { options } from './options';

export function App() {
  const { t } = useTranslation();

  const extensions = useSignal<Extension[]>([]);
  const currentTheme = useSignal(options.get('theme'));
  const showControlPanel = useSignal(options.get('showControlPanel'));

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
      currentTheme.value = options.get('theme');
    });

    GM_registerMenuCommand(t('Open Control Panel'), toggleControlPanel);

    logger.debug('App useEffect executed');
  }, []);

  return (
    <Fragment>
      {/* To show and hide the main UI. */}
      <div
        onClick={toggleControlPanel}
        data-theme={currentTheme.value}
        class="group w-12 h-12 fixed top-[60%] left-[-20px] cursor-pointer bg-transparent fill-base-content"
      >
        <div class="w-full h-full origin origin-[bottom_center] transition-all duration-200 group-hover:translate-x-[5px] group-hover:rotate-[20deg] opacity-50 group-hover:opacity-90">
          <CatIcon />
        </div>
      </div>
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
          <IconBrandTwitterFilled class="mr-2" />
          <h2 class="font-semibold leading-none text-xl m-0 flex-grow">Web Exporter</h2>
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
          <div
            onClick={toggleControlPanel}
            class="w-9 h-9 cursor-pointer flex justify-center items-center transition-colors duration-200 rounded-full hover:bg-base-200"
          >
            <IconX />
          </div>
        </header>
        <p class="text-sm text-base-content text-opacity-70 mb-1 leading-none">
          {t('Browse around to capture more data.')}
        </p>
        <div class="divider mt-0 mb-0"></div>
        {/* Extensions UI. */}
        <main>
          {extensions.value.map((ext) => {
            const Component = ext.render();
            if (ext.enabled && Component) {
              return (
                <ErrorBoundary>
                  <Component key={ext.name} extension={ext} />
                </ErrorBoundary>
              );
            }
            return null;
          })}
        </main>
      </section>
    </Fragment>
  );
}
