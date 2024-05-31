import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/insights/Dashboard.vue';
import store from '@/store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
    },
    {
      path: '/:dashboardUuid',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/:dashboardUuid/widget/:widgetUuid/report/:reportUuid',
      name: 'report',
      component: Dashboard,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/loginexternal/:token',
      name: 'external.login',
      component: null,
      beforeEnter: async (to, from, next) => {
        let { token = '' } = to.params;
        token = token.replace('+', ' ').replace('Bearer ', '');
        const { projectUuid = '' } = to.query;
        await store.dispatch('config/setToken', token);
        await store.dispatch('config/setProject', { uuid: projectUuid });
        next({ name: 'dashboards' });
      },
    },
  ],
});

export default router;
