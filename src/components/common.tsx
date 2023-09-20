import { JSX } from 'preact';
import { CloseButton } from './buttons';

type ExtensionPanelProps = {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
  children?: JSX.Element | JSX.Element[];
};

/**
 * Common template for an extension panel.
 */
export function ExtensionPanel({ title, description, children, onClick, active }: ExtensionPanelProps) {
  return (
    <section class="module-panel">
      {/* Card contents. */}
      <div class="h-14 flex items-center justify-start">
        <div class="relative flex h-4 w-4 mr-3 shrink-0">
          {active && (
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          )}
          <span class="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
        </div>
        <div class="flex flex-col flex-grow">
          <p class="text-base m-0 font-medium leading-none">{title}</p>
          <p class="text-sm text-base-content leading-5 text-opacity-70 m-0">{description}</p>
        </div>
        <button class="btn btn-sm" onClick={onClick}>
          Preview
        </button>
      </div>
      {/* Usually for modal contents. */}
      {children}
    </section>
  );
}

type ModalProps = {
  show?: boolean;
  onClose?: () => void;
  children?: JSX.Element | JSX.Element[];
  title?: string;
};

/**
 * Common template for modals.
 */
export function Modal({ show, onClose, title, children }: ModalProps) {
  if (!show) {
    return <dialog class="modal" />;
  }

  return (
    <dialog class="modal modal-open" open>
      <div class="modal-box p-5">
        <header class="flex items-center h-9">
          <CloseButton class="mr-2" onClick={onClose} />
          <h2 class="leading-none text-xl m-0">{title}</h2>
        </header>
        <main>{children}</main>
      </div>
      <form method="dialog" class="modal-backdrop">
        <div onClick={onClose} />
      </form>
    </dialog>
  );
}
