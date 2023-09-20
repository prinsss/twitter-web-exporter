import { ExtensionPanel, Modal } from '@/components/common';
import { followersSignal } from './data';
import { useToggle } from '@/utils';

export function FollowersPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <ExtensionPanel
      title="Followers"
      description={`Captured: ${followersSignal.value.length}`}
      active={followersSignal.value.length > 0}
      onClick={togglePreview}
    >
      <Modal show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="bg-white max-h-[400px] overflow-y-scroll my-2.5 p-2.5">
          <span class="loading loading-spinner loading-md" />
          {followersSignal.value.map((user) => (
            <p key={user.rest_id}>@{user.legacy.screen_name}</p>
          ))}
        </div>
      </Modal>
    </ExtensionPanel>
  );
}
