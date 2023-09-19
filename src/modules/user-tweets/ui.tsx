import { TweetView } from '@/components/tweet-view';
import { userTweetsSignal } from './data';
import { useToggle } from '@/utils';
import { Modal } from '@/components/modal';

export function UserTweetsPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <section class="extension-panel user-tweets">
      <div class="summary">
        <h3>UserTweets</h3>
        <p>[captured: {userTweetsSignal.value.length}]</p>
        <button onClick={togglePreview}>Preview</button>
      </div>
      <Modal title="Tweets" show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="tweets-preview">
          {userTweetsSignal.value.map((tweet) => (
            <TweetView tweet={tweet} key={tweet.rest_id} />
          ))}
        </div>
      </Modal>
    </section>
  );
}
