import { createRouter, createWebHistory } from 'vue-router';
import Report from '@/views/insights/Report.vue';
import DynamicDashboard from '@/views/insights/DynamicDashboard.vue';
import { safeImport } from '@/utils/moduleFederation';

const { useSharedStore } = await safeImport(
  () => import('connect/sharedStore'),
  'connect/sharedStore',
);

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

const sharedStore = useSharedStore?.();
const sharedProjectUuid = sharedStore?.current?.project?.uuid;

const router = createRouter({
  history: createWebHistory(
    sharedProjectUuid ? `/projects/${sharedProjectUuid}/insights` : '/',
  ),
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
  window.dispatchEvent(
    new CustomEvent('changePathname', {
      detail: {
        pathname: window.location.pathname,
        query: router.query,
      },
    }),
  );
  // window.postMessage(
  //   {
  //     event: 'changePathname',
  //     pathname: window.location.pathname,
  //     query: router.query,
  //   },
  //   '*',
  // );
});

export { routes };

export default router;
