import { Tweet } from '../types/tweet';

export type TweetProps = {
  tweet: Tweet;
};

// Replace any https://t.co/ link in the string with its corresponding real URL.
function renderFullText(tweet: Tweet) {
  let fullText = tweet.legacy.full_text;
  const { urls, media } = tweet.legacy.entities;

  if (urls?.length) {
    for (const { url, expanded_url } of urls) {
      fullText = fullText.replace(url, expanded_url);
    }
  }

  if (media?.length) {
    for (const { url, display_url } of media) {
      fullText = fullText.replace(url, display_url);
    }
  }

  return fullText;
}

// FIXME: style
export function TweetView({ tweet }: TweetProps) {
  const user = tweet.core.user_results.result.legacy;

  return (
    <article class="tweet">
      <div class="tweet-header">
        <a href={`https://twitter.com/${user.screen_name}`} target="_blank">
          <img class="tweet-avatar" src={user.profile_image_url_https} />
        </a>
        <div class="tweet-header-details">
          <a href={`https://twitter.com/${user.screen_name}`} target="_blank">
            <span class="tweet-name">{user.name}</span>
            <span class="tweet-screen-name">@{user.screen_name}</span>
          </a>
          <span class="tweet-date">{tweet.legacy.created_at}</span>
        </div>
      </div>
      {tweet.legacy.in_reply_to_screen_name && (
        <div class="tweet-replying-to">
          Replying to{' '}
          <a href={`https://twitter.com/${tweet.legacy.in_reply_to_screen_name}`} target="_blank">
            @{tweet.legacy.in_reply_to_screen_name}
          </a>
        </div>
      )}
      <div class="tweet-content">{renderFullText(tweet)}</div>
      <div class="tweet-media">
        {tweet.legacy.entities.media?.map((media) => (
          <img src={media.media_url_https} alt={media.display_url} />
        ))}
      </div>
      <div class="tweet-footer">
        <a
          href={`https://twitter.com/${user.screen_name}/status/${tweet.legacy.id_str}`}
          target="_blank"
        >
          <span class="tweet-id">{tweet.legacy.id_str}</span>
        </a>
        <span class="tweet-likes">
          <span class="tweet-likes-count">{tweet.legacy.favorite_count}</span>
          <span class="tweet-likes-label">Likes</span>
        </span>
        <span class="tweet-retweets">
          <span class="tweet-retweets-count">{tweet.legacy.retweet_count}</span>
          <span class="tweet-retweets-label">Retweets</span>
        </span>
      </div>
    </article>
  );
}
