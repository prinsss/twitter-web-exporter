<p align="center">
  <a href="https://github.com/prinsss/twitter-web-exporter">
    <img alt="twitter-web-exporter" src="https://socialify.git.ci/prinsss/twitter-web-exporter/image?description=1&descriptionEditable=Export%20tweets%2C%20bookmarks%2C%20lists%20and%20much%20more%20from%20Twitter(X)%20web%20app.&font=Raleway&forks=0&issues=0&pattern=Plus&pulls=0&theme=Light" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/prinsss/twitter-web-exporter/releases">
    <img alt="UserScript" src="https://badgen.net/badge/userscript/available?color=green" />
  </a>
  <a href="https://github.com/prinsss/twitter-web-exporter/releases">
    <img alt="Latest Release" src="https://badgen.net/github/release/prinsss/twitter-web-exporter" />
  </a>
  <a href="https://github.com/prinsss/twitter-web-exporter/blob/main/LICENSE">
    <img alt="License" src="https://badgen.net/github/license/prinsss/twitter-web-exporter" />
  </a>
  <a href="https://github.com/prinsss/twitter-web-exporter">
    <img alt="TypeScript" src="https://badgen.net/badge/icon/typescript?icon=typescript&label" />
  </a>
</p>

<p align="center">
  English |
  <a href="https://github.com/prinsss/twitter-web-exporter/blob/main/docs/README.zh-Hans.md">简体中文</a>
</p>

## Features

- 🚚 Export tweets, replies and likes of any user as JSON/CSV/HTML
- 🔖 Export your bookmarks (without the max 800 limit!)
- 💞 Export following, followers list of any user
- 👥 Export list members and subscribers
- 🌪️ Export tweets from home timeline and list timeline
- 🔍 Export search results
- 📦 Download images and videos from tweets in bulk at original size
- 🚀 No developer account or API key required
- 🛠️ Ship as a UserScript and everything is done in your browser
- 💾 Your data never leaves your computer
- 💚 Completely free and open-source

## Installation

1. Install the browser extension [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click [HERE](https://github.com/prinsss/twitter-web-exporter/releases/latest/download/twitter-web-exporter.user.js) to install the user script

## Usage

Once the script is installed, you can find a floating panel on the left side of the page. Click the 🐈 Cat button to close the panel or open it again. Click the ⚙️ Cog button to open the settings panel. You can change the UI theme and enable/disable features of script here.

Then open the page that you want to export data from. The script will automatically capture on the following pages:

- User profile page (tweets, replies, media, likes)
- Bookmark page
- Search results page
- User following/followers page
- List members/subscribers page

The numbers of captured data will be displayed on the floating panel. Click the ↗️ Arrow button to open the data table view. You can preview the data captured here and select which items should be exported.

![01-user-interface](https://github.com/prinsss/twitter-web-exporter/raw/main/docs/01-user-interface.png)

Click "Export Data" to export captured data to the selected file format. Currently, the script supports exporting to JSON, CSV and HTML. The exported file will be downloaded to your computer.

By checking the "Include all metadata" option, all available fields from the API will be included in the exported file, giving you the most complete dataset. This could significantly increase the size of the exported data.

Click "Export Media" to bulk download images and videos from tweets.

All media files will be downloaded at its original size in a zip archive. You can also copy the URLs of the media files if you want to download them with a external download manager.

Please set a reasonable value for the "Rate limit" option to avoid downloading too many files at once. The default value is 1000 which means the script will wait for 1 second after downloading each file.

![02-export-media.png](https://github.com/prinsss/twitter-web-exporter/raw/main/docs/02-export-media.png)

## Limitation

The script only works on the web app (twitter.com). It does not work on the mobile app.

Basically, **the script "sees" what you see on the page**. If you can't see the data on the page, the script can't access it either. For example, Twitter displays only the latest 3200 tweets on the profile page and the script can't export tweets older than that.

Data on the web page is loaded dynamically, which means the script can't access the data until it is loaded. You need to keep scrolling down to load more data. Make sure that all data is loaded before exporting.

The export process is not automated (without the help of 3rd party tools). It relies on human interaction to trigger the data fetching process of the Twitter web app. The script itself does not send any request to Twitter API.

The script does not rely on the official Twitter API and thus does not have the same rate limit. However, the Twitter web app does have its own limit. If you hit that rate limit, try again after a few minutes.

On the contrary, the script can export data that is not available from the official API. For example, the official API has a 800 limit when accessing the bookmarks. The script can export all bookmarks without that limit until it's restricted by the Twitter web app itself.

There is also a limitation on downloading media files. Currently, the script downloads pictures and videos to the browser memory and then zip them into a single archive. This could cause the browser to crash if the size of the media files is too large. The maximum archive size it can handle depends on the browser and the available memory of your computer. (2GB on Chrome and 800MB on Firefox)

## FAQ

**Q. How do you get the data?** <br>
A. The script itself does not send any request to Twitter API. It installs an network interceptor to capture the response of GraphQL request that initiated by the Twitter web app. The script then parses the response and extracts data from it.

**Q. The script captures nothing!** <br>
A. See [Content-Security-Policy (CSP) Issues #19](https://github.com/prinsss/twitter-web-exporter/issues/19).

**Q. The exported data is incomplete.** <br>
A. The script can only export data that is loaded by the Twitter web app. Since the data is lazy-loaded, you need to keep scrolling down to load more data. For long lists, you may need to scroll down to the bottom of the page to make sure that all data is loaded before exporting.

**Q. Can the exporting process be automated?** <br>
A. No. At least not without the help of 3rd party tools like auto scrolling.

**Q. Do I need a developer account?** <br>
A. No. The script does not send any request to Twitter API.

**Q. Is there an API rate limit?** <br>
A. No. Not until you hit the rate limit of the Twitter web app itself.

**Q. Will my account be suspended?** <br>
A. Not likely. There is no automatic botting involved and the behavior is similar to manually copying the data from the web page.

**Q: What about privacy?** <br>
A: Everything is processed on your local browser. No data is sent to the cloud.

**Q: Why do you build this?** <br>
A: For archival usage. Twitter's archive only contains the numeric user ID of your following/followers which is not human-readable. The archive also does not contain your bookmarks.

**Q: What's the difference between this and other alternatives?** <br>
A: You don't need a developer account for accessing the Twitter API. You don't need to send your private data to someone's server. The script is completely free and open-source.

**Q: The script does not work!** <br>
A: A platform upgrade will possibly breaks the script's functionality. Please file an [issue](https://github.com/prinsss/twitter-web-exporter/issues) if you encountered any problem.

## License

[MIT](LICENSE)
