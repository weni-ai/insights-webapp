import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createRouter } from './router';

import Unnnic from './utils/plugins/UnnnicSystem';
import i18n from './utils/plugins/i18n';
import './utils/plugins/Hotjar.js';
import './utils/plugins/Firebase.js';

import { getJwtToken } from './utils/jwt';

import * as Sentry from '@sentry/vue';
import env from './utils/env';

import '@weni/unnnic-system/dist/style.css';

import './styles/global.scss';

import { safeImport } from './utils/moduleFederation';

const { useSharedStore } = await safeImport(
  () => import('connect/sharedStore'),
  'connect/sharedStore',
);

const sharedStore = useSharedStore?.();

export default async function mountInsightsApp({
  containerId = 'app',
  routerBase = '/',
} = {}) {
  let appRef = null;

  await getJwtToken().then(() => {
    const app = createApp(App);
    const pinia = createPinia();

    const router = createRouter(routerBase);

    app.use(pinia);
    app.use(router);
    app.use(i18n);
    app.use(Unnnic);

    if (env('SENTRY_DSN')) {
      Sentry.init({
        app,
        dsn: env('SENTRY_DSN'),
        integrations: [
          Sentry.browserTracingIntegration({ router }),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        environment: env('ENVIRONMENT'),
      });
    }

    app.mount(`#${containerId}`);
    appRef = app;
  });

  return appRef;
}

if (sharedStore) {
  localStorage.setItem('token', sharedStore.auth.token);
  localStorage.setItem('projectUuid', sharedStore.current.project.uuid);
} else {
  mountInsightsApp();
}
