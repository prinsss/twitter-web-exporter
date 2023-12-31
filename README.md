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

## Features

- 🎉 Export tweets, replies and likes of any user as JSON/CSV/HTML
- 📖 Export following, followers list of any user
- 🏷️ Export list members and subscribers
- 🔖 Export your bookmarks
- 🛠️ Ships as a UserScript, no need to install any third-party software
- 📦 Everything is processed in local browser, your data never leaves your computer
- 📚 Download images and videos from tweets in bulk at original size
- 💚 Completely free and open-source

## Installation

1. Install the browser extension [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click [HERE](https://github.com/prinsss/twitter-web-exporter/releases/latest/download/twitter-web-exporter.user.js) to install the user script

## Usage

> The documentation is still in progress. Stay tuned!

Once the script is installed, you can find a floating panel on the left side of the page. Click the 🐈 Cat button to close the panel or open it again. Click the ⚙️ Cog button to open the settings panel. You can change the UI theme and enable/disable features of script here.

Then open the page that you want to export data from. The script will automatically capture on the following pages:

- User profile page (tweets, replies, likes)
- Bookmark page
- User following/followers page
- List members/subscribers page

The numbers of captured data will be displayed on the floating panel. Click the ↗️ Arrow button to open the data table view. You can preview the data captured here and select which items should be exported.

<img src="https://github.com/prinsss/twitter-web-exporter/raw/main/docs/01-user-interface.png" alt="01-user-interface" />

Click "Export Data" and select the data type you want to export. Supported data formats are JSON, CSV and HTML.

By checking the "Include all metadata" option, all available fields from the API will be included in the exported file, giving you the most complete dataset. This could significantly increase the size of the exported data.

Click "Export Media" to bulk download images and videos from tweets.

All media files will be downloaded at its original size in a zip archive. Please set a reasonable value for the "Rate limit" option to avoid downloading too many files at once. The default value is 1000 which means the script will wait for 1 second after downloading each file.

<img src="https://github.com/prinsss/twitter-web-exporter/raw/main/docs/02-export-media.png" alt="02-export-media.png" />

## FAQ

Q. How do you get the data?<br>
A. The script itself does not send any request to Twitter API. It will install an interceptor to capture the API response that initiated by the Twitter Web App. The script then parses the response and extracts data from it.

Q. Can the exporting process be automated?<br>
A. No. Since we rely on the Twitter Web App to fetch the data, the script can only be executed when you are viewing the page. For long lists, you may need to scroll down to the bottom of the page to make sure that all data is loaded.

Q. Do I need a developer account?<br>
A. No. The script does not send any request to Twitter API.

Q. Will my account be suspended?<br>
A. Not likely. There is no automatic botting involved and the behavior is similar to manually copying the data from the web page.

Q: What about privacy?<br>
A: Everything is processed on your local browser. No data is sent to the cloud.

Q: Why do you build this?<br>
A: For archival usage. Twitter's archive only contains the numeric user ID of your following/followers which is not human-readable.

Q: What's the difference between this and other alternatives?<br>
A: You don't need a developer account for accessing the Twitter API. You don't need to send your personal data to someone's server. The script is completely free and open-source.

Q: The script does not work!<br>
A: A platform upgrade will possibly breaks the script's functionality. Please file an [issue](https://github.com/prinsss/twitter-web-exporter/issues) if you encountered any problem.

## License

[MIT](LICENSE)
