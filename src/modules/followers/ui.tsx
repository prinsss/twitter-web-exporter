import { Modal } from '@/components/modal';
import { followersSignal } from './data';
import { useToggle } from '@/utils';

export function FollowersPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <section class="extension-panel followers">
      <div class="summary">
        <h3>Followers</h3>
        <p>[captured: {followersSignal.value.length}]</p>
        <button onClick={togglePreview}>Preview</button>
      </div>
      <Modal show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="users-preview">
          {followersSignal.value.map((user) => (
            <p key={user.rest_id}>@{user.legacy.screen_name}</p>
          ))}
        </div>
      </Modal>
    </section>
  );
}
