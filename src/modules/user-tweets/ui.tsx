import { ExtensionPanel, Modal } from '@/components/common';
import { TweetView } from '@/components/tweet-view';
import { userTweetsSignal } from './data';
import { useToggle } from '@/utils';

export function UserTweetsPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <ExtensionPanel
      title="UserTweets"
      description={`Captured: ${userTweetsSignal.value.length}`}
      active={userTweetsSignal.value.length > 0}
      onClick={togglePreview}
    >
      <Modal title="Tweets" show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="bg-white max-h-[400px] overflow-y-scroll my-2.5 p-2.5">
          {userTweetsSignal.value.map((tweet) => (
            <TweetView tweet={tweet} key={tweet.rest_id} />
          ))}
        </div>
        <div class="flex justify-end space-x-2">
          <button class="btn btn-neutral">
            <span class="loading loading-spinner"></span>
            Neutral
          </button>
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
        </div>
      </Modal>
    </ExtensionPanel>
  );
}
