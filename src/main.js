import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Unnnic from './utils/plugins/UnnnicSystem';
import i18n from './utils/plugins/i18n';
import './utils/plugins/Hotjar.js';
import './utils/plugins/Firebase.js';

import * as Sentry from '@sentry/vue';
import env from './utils/env';

import '@weni/unnnic-system/dist/style.css';

import './styles/global.scss';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n);
app.use(Unnnic);

console.log(env('SENTRY_DSN'));

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
app.mount('#app');
