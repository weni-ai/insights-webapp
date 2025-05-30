import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Unnnic from './utils/plugins/UnnnicSystem';
import i18n from './utils/plugins/i18n';

import * as Sentry from '@sentry/vue';
import env from './utils/env';

import '@weni/unnnic-system/dist/style.css';
import './styles/global.scss';

const { useSharedStore } = await import('connect/sharedStore');

export async function mountInsightsApp(containerId) {
  const app = createApp(App);
  const pinia = createPinia();

  const sharedStore = useSharedStore();

  localStorage.setItem('token', sharedStore.auth.token);
  localStorage.setItem('projectUuid', sharedStore.current.project.uuid);

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
  return app;
}
