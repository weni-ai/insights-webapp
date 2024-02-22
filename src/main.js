import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import VueApexCharts from 'vue3-apexcharts';

import Unnnic from '@weni/unnnic-system';
import '@weni/unnnic-system/dist/style.css';

import './styles/global.scss';

const app = createApp(App);

app.use(router);
app.use(Unnnic);
app.use(VueApexCharts);

app.mount('#app');
