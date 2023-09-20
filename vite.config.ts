import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import preact from '@preact/preset-vite';
import tailwindcss from 'tailwindcss';
import prefixSelector from 'postcss-prefix-selector';
import remToPx from 'postcss-rem-to-pixel-next';
import monkey from 'vite-plugin-monkey';

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
      // @ts-ignore
      plugins: [
        tailwindcss(),
        prefixSelector({ prefix: '#twe-root' }),
        remToPx({ propList: ['*'] }),
      ],
    },
  },
  plugins: [
    preact(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'Twitter Web Exporter',
        namespace: 'https://github.com/prinsss',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=twitter.com',
        match: ['*://twitter.com/*'],
        grant: ['unsafeWindow'],
        'run-at': 'document-start',
        updateURL:
          'https://raw.githubusercontent.com/prinsss/twitter-web-exporter/master/dist/twitter-web-exporter.user.js',
        downloadURL:
          'https://raw.githubusercontent.com/prinsss/twitter-web-exporter/master/dist/twitter-web-exporter.user.js',
        require: [
          'https://cdn.jsdelivr.net/npm/preact@10.17.1/dist/preact.min.js',
          'https://cdn.jsdelivr.net/npm/preact@10.17.1/hooks/dist/hooks.umd.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals-core@1.5.0/dist/signals-core.min.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals@1.2.1/dist/signals.min.js',
        ],
      },
      build: {
        externalGlobals: {
          preact: 'preact',
          'preact/hooks': 'preactHooks',
          '@preact/signals': 'preactSignals',
        },
      },
    }),
  ],
});
