import { JSX } from 'preact';
import { CloseButton } from './buttons';
import { EXPORT_FORMAT, ExportFormatType, cx, useSignal } from '@/utils';

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
export function ExtensionPanel({
  title,
  description,
  children,
  onClick,
  active,
}: ExtensionPanelProps) {
  return (
    <section class="module-panel">
      {/* Card contents. */}
      <div class="h-14 flex items-center justify-start">
        <div class="relative flex h-4 w-4 mr-3 shrink-0">
          {active && (
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
          )}
          <span class="relative inline-flex rounded-full h-4 w-4 bg-secondary" />
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
  onExport?: (format: ExportFormatType) => Promise<void>;
  onClear?: () => Promise<void>;
  children?: JSX.Element | JSX.Element[];
  disableFooter?: boolean;
  title?: string;
};

/**
 * Common template for modals.
 */
export function Modal({
  show,
  onClose,
  onExport,
  onClear,
  title,
  children,
  disableFooter,
}: ModalProps) {
  const loading = useSignal<boolean>(false);
  const selectedFormat = useSignal<ExportFormatType>(EXPORT_FORMAT.JSON);

  const onSelectChange: JSX.GenericEventHandler<HTMLSelectElement> = (e) => {
    // @ts-expect-error it's fine.
    selectedFormat.value = e.target.value;
  };

  const onButtonClick: JSX.GenericEventHandler<HTMLButtonElement> = async () => {
    loading.value = true;
    await onExport?.(selectedFormat.value);
    loading.value = false;
  };

  if (!show) {
    return <dialog class="modal" />;
  }

  return (
    <dialog class="modal modal-open" open>
      <div class="modal-box p-3 max-w-4xl md:max-w-screen-md sm:max-w-screen-sm">
        {/* Modal title. */}
        <header class="flex items-center h-9 mb-2">
          <CloseButton class="mr-2" onClick={onClose} />
          <h2 class="leading-none text-xl m-0 font-semibold">{title}</h2>
        </header>
        {/* Modal content. */}
        <main class="max-w-full h-[600px] overflow-scroll bg-base-200 p-2">{children}</main>
        {/* Action buttons. */}
        <div class={cx('flex mt-3 space-x-2', disableFooter && 'hidden')}>
          <button
            class={cx('btn btn-neutral btn-ghost', loading.value && 'pointer-events-none')}
            onClick={onClear}
          >
            Clear
          </button>
          <span class="flex-grow" />
          <select class="select select-secondary w-32" onChange={onSelectChange}>
            {Object.values(EXPORT_FORMAT).map((type) => (
              <option key={type} selected={type === selectedFormat.value}>
                {type}
              </option>
            ))}
          </select>
          <button
            class={cx('btn btn-primary', loading.value && 'btn-disabled')}
            onClick={onButtonClick}
          >
            {loading.value && <span class="loading loading-spinner" />}
            Export
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <div onClick={onClose} />
      </form>
    </dialog>
  );
}
