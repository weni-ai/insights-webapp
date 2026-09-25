import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import i18n from './utils/plugins/i18n';
import './utils/plugins/Hotjar.js';
import './utils/plugins/Firebase.js';
import { setTeleportTarget } from './utils/plugins/unnnicTeleport';

import { moduleStorage } from './utils/storage';

import * as Sentry from '@sentry/vue';
import env from './utils/env';

import './styles/global.scss';

import { isFederatedModule } from './utils/moduleFederation';
import { hostSharedStore } from './utils/hostSharedStore';

export default async function mountInsightsApp({
  containerId = 'app',
  initialRoute,
} = {}) {
  let appRef = null;

  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  app.use(i18n);
  setTeleportTarget(`#${containerId}`);

  if (isFederatedModule && initialRoute) await router.replace(initialRoute);

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

  const container = document.getElementById(containerId);
  if (container) {
    container.classList.add('insights-webapp');
  }

  app.mount(`#${containerId}`);
  appRef = app;

  return { app: appRef, router };
}

if (hostSharedStore && isFederatedModule) {
  const token = hostSharedStore.auth?.token;
  const projectUuid = hostSharedStore.current?.project?.uuid;

  if (token) moduleStorage.setItem('token', token);
  if (projectUuid) moduleStorage.setItem('projectUuid', projectUuid);
}
