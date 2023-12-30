import { Signal } from '@preact/signals';
import { ExtensionPanel, Modal } from '@/components/common';
import { TableView } from '@/components/table/table-view';
import { useToggle } from '@/utils';

type ModuleUIProps<T> = {
  title: string;
  recordsSignal: Signal<T[]>;
  isTweet?: boolean;
};

/**
 * A common UI boilerplate for modules.
 */
export function ModuleUI<T>({ title, recordsSignal, isTweet }: ModuleUIProps<T>) {
  const [showModal, toggleShowModal] = useToggle();

  return (
    <ExtensionPanel
      title={title}
      description={`Captured: ${recordsSignal.value.length}`}
      active={recordsSignal.value.length > 0}
      onClick={toggleShowModal}
      indicatorColor={isTweet ? 'bg-primary' : 'bg-secondary'}
    >
      <Modal title={title} show={showModal} onClose={toggleShowModal}>
        <TableView title={title} show={showModal} recordsSignal={recordsSignal} isTweet={isTweet} />
      </Modal>
    </ExtensionPanel>
  );
}
