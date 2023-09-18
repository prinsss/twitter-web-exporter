import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import preact from '@preact/preset-vite';
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
      },
      // build: {
      //   externalGlobals: {
      //     preact: cdn.jsdelivr('preact', 'dist/preact.min.js'),
      //   },
      // },
    }),
  ],
});
