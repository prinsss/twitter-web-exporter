import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

import preact from '@preact/preset-vite';
import monkey from 'vite-plugin-monkey';
import i18nextLoader from 'vite-plugin-i18next-loader';

import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';
import remToPx from 'postcss-rem-to-pixel-next';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: false,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
        remToPx({ propList: ['*'] }),
        // Use scoped CSS.
        prefixSelector({
          prefix: '#twe-root',
          transform(prefix, selector, prefixedSelector) {
            if (selector.match(/:root/)) {
              return selector.replace(/:root/, prefix);
            }

            if (selector.match(/html/)) {
              return selector.replace(/html/, prefix);
            }

            return prefixedSelector;
          },
        }),
      ],
    },
  },
  plugins: [
    preact(),
    i18nextLoader({ paths: ['./src/i18n/locales'], namespaceResolution: 'basename' }),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: {
          '': 'Twitter Web Exporter',
          'zh-CN': 'Twitter 数据导出工具',
          'zh-TW': 'Twitter 資料匯出工具',
          ja: 'Twitter データエクスポーター',
        },
        description: {
          '': 'Export tweets, bookmarks, lists and much more to JSON/CSV/HTML from Twitter(X) web app.',
          'zh-CN': '从 Twitter(X) 网页版导出推文、书签、列表等各种数据，支持导出 JSON/CSV/HTML。',
          'zh-TW': '從 Twitter(X) 網頁版匯出推文、書籤、列表等各種資料，支援匯出 JSON/CSV/HTML。',
          ja: 'Twitter(X) ブラウザ版からツイート、ブックマーク、リストなどを取得し JSON/CSV/HTML に出力します。',
        },
        namespace: 'https://github.com/prinsss',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABmklEQVR4Ae3XA4wcARSA4dq2bUQ1g9pRbVtBzai2otpug9pxUttn2753/3m9Ozq/5NsdvvfGM6VKoshE8/ORFbAMbxCGWHzDHjS2sXxPlM0eKYclGoq3w1eIHVGYikaYg6e4ZppgAgQrVBSvDw+IEylIhSAATUyTHIYgFdsUNnAGosAfDMccLMtOchli4g7quFC8FhIhCsRD8Bk1sxMdgVjwxRyUdtDABIgKH9DQNNEkiB1fMB9VbDSwEKLQJ1S1TFQRXhAHYnADy9ETdTEeotAze7tzNJIhCiRBFLpnq/hmzMR65UkVO2WrgaOQPLLW3u6XPDLAVgOl8R5isEhUtHcSdkEoxEBXnN3ZuuMbxCDDnTVQF52xBcEQHX1BaWcNtDLwMpzg6tNtN0RnD5U8XsviGkQnYWih9CWjNBbDHaJBMsZqec8rjV54B1EoFXO0Fh+DrxCFEjBTTdFy6IvNGu4Hf9FXSdGheAUvjZdgLPajqtp3+jl4jVSIAgHYjRZ6fWC0wSpcwScEQZCMUPzEfezEYJQrVRKFOdIAZGq1QBG8EiYAAAAASUVORK5CYII=',
        match: ['*://twitter.com/*', '*://x.com/*'],
        grant: ['unsafeWindow'],
        'run-at': 'document-start',
        updateURL:
          'https://github.com/prinsss/twitter-web-exporter/releases/latest/download/twitter-web-exporter.user.js',
        downloadURL:
          'https://github.com/prinsss/twitter-web-exporter/releases/latest/download/twitter-web-exporter.user.js',
        require: [
          'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js',
          'https://cdn.jsdelivr.net/npm/i18next@23.11.1/i18next.min.js',
          'https://cdn.jsdelivr.net/npm/preact@10.19.3/dist/preact.min.js',
          'https://cdn.jsdelivr.net/npm/preact@10.19.3/hooks/dist/hooks.umd.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals-core@1.5.1/dist/signals-core.min.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals@1.2.2/dist/signals.min.js',
          'https://cdn.jsdelivr.net/npm/@tanstack/table-core@8.11.2/build/umd/index.production.js',
          // We bundle FileSaver.js in the script since the UMD build is broken.
          // See: https://github.com/eligrey/FileSaver.js/issues/500
          // 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
        ],
      },
      build: {
        externalGlobals: {
          dayjs: 'dayjs',
          i18next: 'i18next',
          preact: 'preact',
          'preact/hooks': 'preactHooks',
          '@preact/signals': 'preactSignals',
          '@tanstack/table-core': 'TableCore',
        },
      },
    }),
  ],
});
