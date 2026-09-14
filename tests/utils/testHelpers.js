import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import { vi } from 'vitest';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.js';

/**
 * Minimal installable router when vue-router is partially mocked
 * (e.g. vi.mock without importOriginal). Still satisfies
 * app.use(router) and provides $router/$route.
 */
function createStubRouterPlugin(options = {}) {
  const route = {
    path: options.path ?? '/',
    fullPath: options.path ?? '/',
    query: options.query ?? {},
    params: options.params ?? {},
    name: options.name ?? null,
    meta: options.meta ?? {},
    matched: [],
    hash: '',
  };

  const router = {
    currentRoute: { value: route },
    push: vi.fn(() => Promise.resolve()),
    replace: vi.fn(() => Promise.resolve()),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    options: { routes: [] },
    install(app) {
      app.config.globalProperties.$router = router;
      app.config.globalProperties.$route = route;
    },
  };

  return router;
}

/**
 * Lightweight in-memory router for unit tests.
 * Avoids Vue's "injection Symbol(router) not found" warnings.
 *
 * Falls back to a stub plugin if the test file mocks vue-router without
 * re-exporting createRouter (common incomplete mock).
 *
 * @param {object} [options]
 * @param {string} [options.path='/']
 * @param {object} [options.query={}]
 * @param {object} [options.params={}]
 * @param {Array} [options.routes]
 */
export function createMockRouter(options = {}) {
  if (
    typeof createRouter !== 'function' ||
    typeof createMemoryHistory !== 'function'
  ) {
    return createStubRouterPlugin(options);
  }

  const {
    path = '/',
    query = {},
    params = {},
    routes = [
      {
        path: '/:pathMatch(.*)*',
        name: 'catch-all',
        component: { template: '<div />' },
      },
    ],
  } = options;

  try {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    Object.assign(router.currentRoute.value, {
      path,
      fullPath:
        path +
        (Object.keys(query).length
          ? `?${new URLSearchParams(query).toString()}`
          : ''),
      query,
      params,
      name: options.name ?? null,
      meta: options.meta ?? {},
    });

    return router;
  } catch {
    return createStubRouterPlugin(options);
  }
}

/** Shared default router instance used by setupVitest */
export const mockRouter = createMockRouter();

/**
 * Create a local i18n instance for a single mount (prefer not assigning
 * to config.global.plugins — use globalPluginsWithI18n() when needed).
 *
 * @param {object} [messages={}]
 * @param {object} [options]
 */
export function createTestI18n(messages = {}, options = {}) {
  const isFullMap =
    messages.en !== undefined ||
    messages['pt-br'] !== undefined ||
    messages.es !== undefined;

  return createI18n({
    legacy: false,
    locale: options.locale ?? 'en',
    fallbackLocale: 'en',
    messages: isFullMap ? messages : { en: messages },
    globalInjection: true,
    silentTranslationWarn: true,
    silentFallbackWarn: true,
    missingWarn: false,
    fallbackWarn: false,
    ...(options.i18nOptions || {}),
  });
}

/**
 * Replace config.global.plugins for a file that needs custom i18n messages,
 * always keeping Unnnic + router so warnings do not return.
 *
 * @param {import('vue-i18n').I18n} i18n
 * @param {import('@vue/test-utils').GlobalMountOptions['plugins']} [extra=[]]
 */
export function globalPluginsWithI18n(i18n, extra = []) {
  return [i18n, UnnnicSystemPlugin, mockRouter, ...extra];
}

export { UnnnicSystemPlugin };
