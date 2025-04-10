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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const nextPath = to.query.next;

  if (nextPath)
    next({ path: nextPath, query: { ...to.query, next: undefined } });
  else next();
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
