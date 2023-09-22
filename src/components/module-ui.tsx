import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { ExtensionPanel, Modal } from '@/components/common';
import { EXPORT_FORMAT, ExportFormatType, cx, saveFile, useToggle } from '@/utils';
import logger from '@/utils/logger';

type AbstractModuleUIProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  isTweet?: boolean;
};

/**
 * A common UI boilerplate for modules.
 */
export function AbstractModuleUI<T>({ title, recordsSignal, isTweet }: AbstractModuleUIProps<T>) {
  const [showPreviewSignal, togglePreview] = useToggle();

  const loading = useSignal<boolean>(false);
  const selectedFormat = useSignal<ExportFormatType>(EXPORT_FORMAT.JSON);

  const onSelectChange: JSX.GenericEventHandler<HTMLSelectElement> = (e) => {
    // @ts-expect-error it's fine.
    selectedFormat.value = e.target.value;
  };

  const onExport = async () => {
    try {
      let content = '';
      const format = selectedFormat.value;
      loading.value = true;

      const filename = `twitter-${title}-${Date.now()}.${format.toLowerCase()}`;
      logger.info(`Exporting to ${format} file: ${filename}`);

      switch (format) {
        case EXPORT_FORMAT.JSON:
          content = JSON.stringify(recordsSignal.value, undefined, '  ');
          break;
        case EXPORT_FORMAT.HTML:
          content = '<html></html>';
          break;
        case EXPORT_FORMAT.CSV:
          content = 'id,name';
          break;
      }

      saveFile(filename, content);
    } catch (err) {
      logger.errorWithBanner('Failed to export file.', err as Error);
    } finally {
      loading.value = false;
    }
  };

  const onClear = async () => {
    recordsSignal.value = [];
  };

  return (
    <ExtensionPanel
      title={title}
      description={`Captured: ${recordsSignal.value.length}`}
      active={recordsSignal.value.length > 0}
      onClick={togglePreview}
      indicatorColor={isTweet ? 'bg-primary' : 'bg-secondary'}
    >
      <Modal title={title} show={showPreviewSignal.value} onClose={togglePreview}>
        {/* Modal content. */}
        <main class="max-w-full h-[600px] overflow-scroll bg-base-200 p-2">
          <pre class="text-xs leading-none">{JSON.stringify(recordsSignal.value, null, 2)}</pre>
        </main>
        {/* Action buttons. */}
        <div class="flex mt-3 space-x-2">
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
          <button class={cx('btn btn-primary', loading.value && 'btn-disabled')} onClick={onExport}>
            {loading.value && <span class="loading loading-spinner" />}
            Export
          </button>
        </div>
      </Modal>
    </ExtensionPanel>
  );
}
