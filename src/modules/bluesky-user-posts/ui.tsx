import { ColumnDef } from '@tanstack/table-core';

import { ExtensionPanel, Modal } from '@/components/common';
import { BaseTableView } from '@/components/table/base';
import { useCaptureCount, useClearCaptures } from '@/core/database/hooks';
import { Extension } from '@/core/extensions';
import { useTranslation } from '@/i18n';
import { BlueskyPost } from '@/types';
import { useToggle } from '@/utils/common';

import { columnsBlueskyPost } from './columns';
import { useCapturedBlueskyPosts } from '@/core/database/hooks';

export function BlueskyUserPostsUI({ extension }: { extension: Extension }) {
  const { t } = useTranslation();
  const [showModal, toggleShowModal] = useToggle();

  const title = t('BlueskyUserPosts');
  const count = useCaptureCount(extension.name);
  const records = useCapturedBlueskyPosts(extension.name);
  const clearData = useClearCaptures(extension.name);

  return (
    <ExtensionPanel
      title={title}
      description={`${t('Captured:')} ${count}`}
      active={!!count && count > 0}
      onClick={toggleShowModal}
      indicatorColor="bg-info"
    >
      <Modal
        class="max-w-4xl md:max-w-screen-md sm:max-w-screen-sm min-h-[512px]"
        title={title}
        show={showModal}
        onClose={toggleShowModal}
      >
        <BaseTableView<BlueskyPost>
          title={title}
          records={(records as BlueskyPost[]) ?? []}
          columns={columnsBlueskyPost as ColumnDef<BlueskyPost>[]}
          clear={clearData}
        />
      </Modal>
    </ExtensionPanel>
  );
}
