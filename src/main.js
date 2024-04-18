import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import ApexCharts from './utils/plugins/ApexCharts';
import Unnnic from './utils/plugins/UnnnicSystem';
import '@weni/unnnic-system/dist/style.css';

import './styles/global.scss';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(Unnnic);
app.use(ApexCharts);

app.mount('#app');
