<p align="center">
  <a href="https://github.com/prinsss/twitter-web-exporter">
    <img alt="twitter-web-exporter" src="https://socialify.git.ci/prinsss/twitter-web-exporter/image?description=1&descriptionEditable=Export%20tweets%2C%20bookmarks%2C%20lists%20and%20much%20more%20from%20Twitter(X)%20web%20app.&font=Raleway&forks=0&issues=0&pattern=Plus&pulls=0&theme=Light&logo=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2F%40tabler%2Ficons%403.19.0%2Ficons%2Foutline%2Fbrand-twitter.svg" />
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
  <a href="https://github.com/prinsss/twitter-web-exporter/blob/main/README.md">English</a>
   | 简体中文
</p>

## 功能

- 🚚 以 JSON/CSV/HTML 格式导出用户的推文、回复和喜欢
- 🔖 导出你的书签（没有最多 800 条的数量限制！）
- 💞 导出任意用户的关注者、粉丝列表
- 👥 导出列表成员和订阅者
- 🌪️ 导出主页时间线和列表时间线中的推文
- 🔍 导出搜索结果
- ✉️ 导出私信
- 📦 以原始尺寸批量下载推文中的图片和视频
- 🚀 无需开发者账号或 API 密钥
- 🛠️ 以油猴脚本的形式提供，所有操作均在浏览器内完成
- 💾 你的数据永远不会离开你的计算机
- 💚 完全免费开源

## 安装

1. 安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 点击 [这里](https://github.com/prinsss/twitter-web-exporter/releases/latest/download/twitter-web-exporter.user.js) 安装用户脚本

## 使用方法

安装脚本后，你会在页面左侧看到一个浮动面板。点击 🐈 猫咪按钮关闭面板或重新打开。你也可以通过点击浏览器菜单栏上的 Tampermonkey/Violentmonkey 图标，然后在脚本菜单中打开控制面板。

如果你看不到猫咪按钮，也看不到如图所示的脚本菜单选项，请检查脚本是否已正确安装并启用。

![03-menu-commands](https://github.com/prinsss/twitter-web-exporter/raw/main/docs/03-menu-commands.png)

点击 ⚙️ 齿轮按钮打开设置面板。你可以在此处更改 UI 主题并启用/禁用脚本功能。

然后打开要从中导出数据的页面。脚本会自动捕获以下页面上的数据：

- 用户个人资料页面（推文、回复、媒体、喜欢）
- 书签页面
- 搜索结果页面
- 用户关注者/粉丝页面
- 列表成员/订阅者页面

在浮动面板上会显示已经捕获的数据条数，点击 ↗️ 箭头按钮可以打开数据表视图。你可以在这里预览捕获到的数据并选择要导出的项。

![01-user-interface](https://github.com/prinsss/twitter-web-exporter/raw/main/docs/01-user-interface.png)

点击「导出数据」可将捕获到的数据导出为选定的文件格式。目前，脚本支持导出为 JSON、CSV 和 HTML。导出的文件将下载到你的计算机上。

如果勾选「包括所有元数据」选项，导出的文件中将会包含 API 中提供的所有字段，为你提供最完整的数据集。这可能会显著增加导出数据的大小。

点击「导出媒体」可批量下载推文中的图片和视频。

所有媒体文件都将以其原始尺寸打包下载到一个 zip 压缩文件中。如果想要使用外部下载管理器下载它们，也可以点击「复制 URL」复制媒体文件的下载地址。

请合理设置「速率限制」选项的值，以避免一次下载太多文件。默认值是 1000，这意味着脚本将在下载每个文件后等待 1 秒。

![02-export-media.png](https://github.com/prinsss/twitter-web-exporter/raw/main/docs/02-export-media.png)

## 局限性

此脚本仅在 Web App (twitter.com) 上运行，在手机 App 上无效。

简单来说，**此脚本只能“看到”你在页面上能看到的内容**。如果你在页面上看不到某些数据，脚本也无法访问该数据。例如，Twitter 在个人资料页上仅显示最新的 3200 条推文，那么脚本就无法导出比这更早的推文。

网页上的数据是动态加载的，这意味着只有当数据被加载到本地之后，脚本才能访问这些数据。你需要在页面上不断向下滚动以加载更多数据。导出之前，请确保所有数据都已加载完毕。

导出过程不是自动化的（除非配合使用第三方辅助工具）。此脚本依赖于用户操作来触发 Twitter Web App 的数据获取过程。脚本本身不会向 Twitter API 发送任何请求。

此脚本不依赖于官方 Twitter API，因此没有官方 API 的速率限制。但是，Twitter Web App 自身是有限制的。如果达到了该速率限制，请稍后重试。

另一方面，此脚本可以导出官方 API 中不提供的数据。例如，官方 API 在访问书签时有最多获取 800 条的限制。而此脚本可以无限制地导出所有书签，除非 Twitter Web App 本身被限制。

另外，媒体文件下载功能也存在一定的限制。目前，脚本会将图片和视频下载到浏览器内存中，然后压缩为单个压缩包。如果媒体文件的大小过大，可能会导致浏览器崩溃。其最大支持的压缩包大小取决于浏览器和计算机可用内存。（Chrome 上为 2GB，Firefox 上为 800MB）

## 常见问题

**问：你是如何获取数据的？** <br>
答：此脚本本身不会向 Twitter API 发起任何请求。它会安装一个 HTTP 网络拦截器，来捕获 Twitter Web App 发起的 GraphQL 请求的响应，然后解析响应并从中提取数据。

**问：脚本抓取不到任何数据！** <br>
答：参见 [Content-Security-Policy (CSP) Issues #19](https://github.com/prinsss/twitter-web-exporter/issues/19)。

**问：为什么导出的数据不完整？** <br>
答：脚本只能导出由 Twitter Web App 加载好的数据。由于数据是懒加载的，你需要不断向下滚动以加载更多数据。对于长列表，可能需要滚动到页面底部，确保所有数据加载完毕后再导出。

**问：导出过程可以自动化吗？** <br>
答：不可以。除非使用第三方工具辅助配合，比如 Auto Scroll 自动滚动工具。

**问：我需要申请开发者帐户吗？** <br>
答：不需要。此脚本不向 Twitter API 发送任何请求。

**问：是否有 API 速率限制？** <br>
答：没有。除非你达到了 Twitter Web App 本身的速率限制。

**问：使用脚本是否会导致封号？** <br>
答：基本不可能。此脚本中不存在任何自动操作，行为类似于你手动从网页上拷贝数据。

**问：关于隐私问题？** <br>
答：所有操作都在你的本地浏览器中完成。不会将数据发送到云端。

**问：你为什么要做这个？** <br>
答：用于归档。Twitter 的存档导出仅包含关注者/粉丝的数字用户 ID，根本不是给人看的。而且存档还不包含书签。

**问：与其他替代方案有何不同？** <br>
答：无需为 Twitter API 申请开发者帐户。无需将你的私人数据发送到别人的服务器。此脚本完全免费且开源。

**问：脚本无法运行！** <br>
答：平台升级可能会导致脚本功能故障。如果遇到任何问题，请提交 [issue](https://github.com/prinsss/twitter-web-exporter/issues) 反馈。

## 开源许可

[MIT](LICENSE)
