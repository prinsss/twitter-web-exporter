import { Signal } from '@preact/signals';
import { ExtensionPanel, Modal } from '@/components/common';
import { TableView } from '@/components/table/table-view';
import { TranslationKey, useTranslation } from '@/i18n';
import { useToggle } from '@/utils/common';

type ModuleUIProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  isTweet?: boolean;
};

/**
 * A common UI boilerplate for modules.
 */
export function ModuleUI<T>({ title, recordsSignal, isTweet }: ModuleUIProps<T>) {
  const { t } = useTranslation();
  const [showModal, toggleShowModal] = useToggle();

  const translatedTitle = t(title as TranslationKey);

  return (
    <ExtensionPanel
      title={translatedTitle}
      description={`${t('Captured:')} ${recordsSignal.value.length}`}
      active={recordsSignal.value.length > 0}
      onClick={toggleShowModal}
      indicatorColor={isTweet ? 'bg-primary' : 'bg-secondary'}
    >
      <Modal title={translatedTitle} show={showModal} onClose={toggleShowModal}>
        <TableView
          title={translatedTitle}
          show={showModal}
          recordsSignal={recordsSignal}
          isTweet={isTweet}
        />
      </Modal>
    </ExtensionPanel>
  );
}
