import { createRouter, createWebHistory } from 'vue-router';
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
      redirect: (_to) => {
        return 'dashboard';
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
