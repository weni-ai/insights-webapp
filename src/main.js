import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Unnnic from './utils/plugins/UnnnicSystem';
import i18n from './utils/plugins/i18n';
import './utils/plugins/Hotjar.js';
import './utils/plugins/Firebase.js';

import '@weni/unnnic-system/dist/style.css';

import './styles/global.scss';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n);
app.use(Unnnic);

app.mount('#app');
