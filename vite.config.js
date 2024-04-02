import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    define: {
      'process.env': env,
    },
    plugins: [vue(), vueJsx()],
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
  });
};
