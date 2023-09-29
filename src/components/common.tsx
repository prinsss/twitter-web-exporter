import { JSX } from 'preact';
import { cx } from '@/utils';
import { CloseIcon } from './icons';

type ExtensionPanelProps = {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
  children?: JSX.Element | JSX.Element[];
  indicatorColor?: string;
};

/**
 * Common template for an extension panel.
 */
export function ExtensionPanel({
  title,
  description,
  children,
  onClick,
  active,
  indicatorColor = 'bg-secondary',
}: ExtensionPanelProps) {
  return (
    <section class="module-panel">
      {/* Card contents. */}
      <div class="h-14 flex items-center justify-start">
        <div class="relative flex h-4 w-4 mr-3 shrink-0">
          {active && (
            <span
              class={cx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                indicatorColor,
              )}
            />
          )}
          <span class={cx('relative inline-flex rounded-full h-4 w-4', indicatorColor)} />
        </div>
        <div class="flex flex-col flex-grow">
          <p class="text-base m-0 font-medium leading-none">{title}</p>
          <p class="text-sm text-base-content leading-5 text-opacity-70 m-0">{description}</p>
        </div>
        <button class="btn btn-sm" onClick={onClick}>
          Preview
        </button>
      </div>
      {/* Modal entries. */}
      {children}
    </section>
  );
}

type ModalProps = {
  show?: boolean;
  onClose?: () => void;
  children?: JSX.Element | JSX.Element[];
  title?: string;
  class?: string;
};

/**
 * Common template for modals.
 */
export function Modal({
  show,
  onClose,
  title,
  children,
  class: className = 'max-w-4xl md:max-w-screen-md sm:max-w-screen-sm',
}: ModalProps) {
  if (!show) {
    return <dialog class="modal" />;
  }

  return (
    <dialog class="modal modal-open" open>
      <div class={cx('modal-box p-3', className)}>
        <header class="flex items-center h-9 mb-2">
          <div
            onClick={onClose}
            class="w-9 h-9 mr-2 cursor-pointer flex justify-center items-center transition-colors duration-200 rounded-full hover:bg-base-200"
          >
            <CloseIcon />
          </div>
          <h2 class="leading-none text-xl m-0 font-semibold">{title}</h2>
        </header>
        {children}
      </div>
      <form method="dialog" class="modal-backdrop">
        <div onClick={onClose} />
      </form>
    </dialog>
  );
}
