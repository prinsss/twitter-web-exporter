import { TweetView } from '@/components/tweet-view';
import { userTweetsSignal } from './data';
import { useToggle } from '@/utils';
import { Modal } from '@/components/modal';

export function UserTweetsPanel() {
  const [showPreviewSignal, togglePreview] = useToggle();

  return (
    <section class="border-0 border-t border-t-[#bfbfbf] border-solid">
      <div class="h-10 flex items-center justify-start">
        <h3 class="m-0">UserTweets</h3>
        <p class="grow text-sm ml-[5px]">[captured: {userTweetsSignal.value.length}]</p>
        <button onClick={togglePreview}>Preview</button>
      </div>
      <Modal title="Tweets" show={showPreviewSignal.value} onClose={togglePreview}>
        <div class="bg-white max-h-[400px] overflow-y-scroll my-2.5 p-2.5">
          {userTweetsSignal.value.map((tweet) => (
            <TweetView tweet={tweet} key={tweet.rest_id} />
          ))}
        </div>
      </Modal>
    </section>
  );
}
