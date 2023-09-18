import { useSignal } from '@preact/signals';
import { followersSignal } from './data';

export function FollowersPanel() {
  const showPreview = useSignal(false);

  return (
    <section class="followers-panel">
      <div class="summary">
        <h3>Followers</h3>
        <p>Captured: {followersSignal.value.length}</p>
        <button
          onClick={() => {
            showPreview.value = !showPreview.value;
          }}
        >
          Toggle Preview
        </button>
      </div>
      {showPreview.value && (
        <div class="users-preview">
          {followersSignal.value.map((user) => (
            <p key={user.rest_id}>@{user.legacy.screen_name}</p>
          ))}
        </div>
      )}
    </section>
  );
}
