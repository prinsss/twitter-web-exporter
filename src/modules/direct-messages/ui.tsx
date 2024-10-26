import { ColumnDef } from '@tanstack/table-core';

import { ExtensionPanel, Modal } from '@/components/common';
import { BaseTableView } from '@/components/table/base';
import { useTranslation } from '@/i18n';
import { useToggle } from '@/utils/common';

import { messagesSignal } from './api';
import { columns } from './columns';
import { Message } from './types';

export function DirectMessagesUI() {
  const { t } = useTranslation();
  const [showModal, toggleShowModal] = useToggle();

  const title = t('DirectMessages');
  const count = messagesSignal.value.length;

  return (
    <ExtensionPanel
      title={title}
      description={`${t('Captured:')} ${count}`}
      active={!!count && count > 0}
      onClick={toggleShowModal}
      indicatorColor="bg-accent"
    >
      <Modal
        class="max-w-4xl md:max-w-screen-md sm:max-w-screen-sm min-h-[512px]"
        title={title}
        show={showModal}
        onClose={toggleShowModal}
      >
        <BaseTableView<Message>
          title={title}
          records={messagesSignal.value}
          columns={columns as ColumnDef<Message>[]}
          clear={() => (messagesSignal.value = [])}
        />
      </Modal>
    </ExtensionPanel>
  );
}
