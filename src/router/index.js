import { createRouter, createWebHistory } from 'vue-router';
import Report from '@/views/insights/Report.vue';
import DynamicDashboard from '@/views/insights/DynamicDashboard.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: DynamicDashboard,
  },
  {
    path: '/:dashboardUuid',
    name: 'dashboard',
    component: DynamicDashboard,
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
    redirect: (to) => {
      return { path: to.query.next || '/', query: to.query };
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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

export { routes };

export default router;
