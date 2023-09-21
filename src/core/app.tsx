import { Fragment } from 'preact';
import { twMerge } from 'tailwind-merge';
import extensions from './extensions';
import { CatButton, CloseButton, SettingsButton } from '@/components/buttons';
import { useToggle } from '@/utils';

export function App() {
  const [showControlPanel, toggleControlPanel] = useToggle(true);

  return (
    <Fragment>
      {/* To show and hide the main UI. */}
      <CatButton class="btn-cat fixed top-[60%] left-[-20px]" onClick={toggleControlPanel} />
      {/* The main UI block. */}
      <section
        class={twMerge(
          'card card-compact bg-base-100 fixed border shadow-xl w-80 leading-loose text-base-content px-4 py-3 rounded-2xl border-solid border-neutral-content left-8 top-8 transition-transform translate-x-[-500px] duration-500',
          showControlPanel.value && 'block translate-x-0 transform-none',
        )}
      >
        {/* Card title. */}
        <header class="flex items-center h-9">
          <h2 class="font-semibold leading-none text-xl m-0 flex-grow">Web Exporter (α)</h2>
          <SettingsButton class="mr-2" />
          <CloseButton class="mr-[-5px]" onClick={toggleControlPanel} />
        </header>
        <p class="text-sm text-base-content text-opacity-70 mt-1 mb-2 leading-none">
          Refresh or clear to start new captures.
        </p>
        <div class="divider mt-0 mb-0"></div>
        {/* Extensions UI. */}
        <main>
          {extensions.getPanels().map((Panel) => (
            <Panel />
          ))}
        </main>
      </section>
    </Fragment>
  );
}
