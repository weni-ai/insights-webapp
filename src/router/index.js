import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import Dashboard from '@/views/insights/Dashboard.vue';
import Report from '@/views/insights/Report.vue';

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
      path: '/:dashboardUuid/widget/:widgetUuid/report',
      name: 'report',
      component: Report,
    },
    {
      path: '/loginexternal/:token',
      name: 'external.login',
      component: null,
      beforeEnter: async (to) => {
        let { token = '' } = to.params;
        token = token.replace('+', ' ').replace('Bearer ', '');
        const { projectUuid = '' } = to.query;
        localStorage.setItem('token', token);
        localStorage.setItem('projectUuid', projectUuid);
        await store.dispatch('config/setToken', token);
        await store.dispatch('config/setProject', { uuid: projectUuid });
        const { isLoadingDashboards } = store.state.dashboards;
        if (!isLoadingDashboards) {
          await store.dispatch('dashboards/getDashboards');
        }
      },
    },
  ],
});

router.afterEach((router) => {
  delete router.query.next;
  delete router.query.projectUuid;
  window.parent.postMessage(
    {
      event: 'changePathname',
      pathname: window.location.pathname,
      query: router.query,
    },
    '*',
  );
});

export default router;
