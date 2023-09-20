import { Modal } from '@/components/modal';
import { followersSignal } from './data';
import { useToggle } from '@/utils';
import { Loading } from '@/components/loading';

export function FollowersPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <section class="border-0 border-t border-t-[#bfbfbf] border-solid">
      <div class="h-10 flex items-center justify-start">
        <h3 class="m-0">Followers</h3>
        <p class="grow text-sm ml-[5px]">[captured: {followersSignal.value.length}]</p>
        <button onClick={togglePreview}>Preview</button>
      </div>
      <Modal show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="bg-white max-h-[400px] overflow-y-scroll my-2.5 p-2.5">
          <Loading />
          {followersSignal.value.map((user) => (
            <p key={user.rest_id}>@{user.legacy.screen_name}</p>
          ))}
        </div>
      </Modal>
    </section>
  );
}
