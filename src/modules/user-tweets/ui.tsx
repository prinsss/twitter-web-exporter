import { useSignal } from '@preact/signals';
import { TweetView } from '@/components/tweet-view';
import { userTweetsSignal } from './data';

export function UserTweetsPanel() {
  const showPreview = useSignal(false);

  return (
    <section class="user-tweets-panel">
      <div class="summary">
        <h3>UserTweets</h3>
        <p>Captured: {userTweetsSignal.value.length}</p>
        <button
          onClick={() => {
            showPreview.value = !showPreview.value;
          }}
        >
          Toggle Preview
        </button>
      </div>
      {showPreview.value && (
        <div class="tweets-preview">
          {userTweetsSignal.value.map((tweet) => (
            <TweetView tweet={tweet} key={tweet.rest_id} />
          ))}
        </div>
      )}
    </section>
  );
}
