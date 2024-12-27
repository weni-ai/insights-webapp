import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [
        ...configDefaults.exclude,
        'e2e/*',
        'src/router/**',
        'src/services/api/http.js',
        'src/services/api/customError.js',
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: './setupVitest.js',
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{vue,js,ts}'],
        exclude: [
          'src/main.js',
          '**/__tests__/**',
          'src/router/**',
          'src/services/api/http.js',
          'src/services/api/customError.js',
        ],
      },
    },
  }),
);
