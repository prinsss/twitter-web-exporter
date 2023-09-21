import { ExtensionPanel, Modal } from '@/components/common';
import { EXPORT_FORMAT, ExportFormatType, saveFile, useToggle } from '@/utils';
import logger from '@/utils/logger';
import { Signal } from '@preact/signals';

type AbstractModuleUIProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
};

/**
 * A common UI boilerplate for modules.
 */
export function AbstractModuleUI<T>({ title, recordsSignal }: AbstractModuleUIProps<T>) {
  const [showPreviewSignal, togglePreview] = useToggle();

  const onExport = async (format: ExportFormatType) => {
    try {
      let content = '';
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
    >
      <Modal
        title={title}
        show={showPreviewSignal.value}
        onClose={togglePreview}
        onExport={onExport}
        onClear={onClear}
      >
        <pre class="text-xs leading-none">{JSON.stringify(recordsSignal.value, null, 2)}</pre>
      </Modal>
    </ExtensionPanel>
  );
}
