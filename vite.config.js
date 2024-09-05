import { fileURLToPath, URL } from 'node:url';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const htmlTransform = () => ({
  name: 'html-transform',
  apply: 'build',
  closeBundle() {
    const indexPath = path.resolve(__dirname, 'dist', 'index.html');

    const hash = createHash('md5')
      .update(Date.now().toString())
      .digest('hex')
      .substring(0, 8);

    let html = fs.readFileSync(indexPath, 'utf-8');

    // Added the query string ?v=[hash] for CSS and JS only
    html = html.replace(/(\/assets\/insights\.(js|css))/g, `$1?v=${hash}`);

    fs.writeFileSync(indexPath, html);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), htmlTransform()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@weni/unnnic-system/src/assets/scss/unnnic.scss';
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
      
        entryFileNames: 'assets/insights.js',
        chunkFileNames: 'assets/insights.js', 
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/insights.css'; 
          }
          return 'assets/' + assetInfo.name;
        },
      },
    },
  },
});
