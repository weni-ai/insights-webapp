import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import Report from '@/views/insights/Report.vue';
import DynamicDashboard from '@/views/insights/DynamicDashboard.vue';

const routes = [
  {
    path: '/',
    alias: '/init',
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

let currentRouterInstance = null;

export function createInsightsRouter(options = {}) {
  const { isFederatedModule = false } = options;

  const history = isFederatedModule
    ? createMemoryHistory() // To isolate routing from parent app
    : createWebHistory('/');

  const router = createRouter({
    history,
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

    if (isFederatedModule) {
      window.dispatchEvent(
        new CustomEvent('updateRoute', {
          detail: { path: router.path, query: router.query },
        }),
      );
    } else {
      window.parent.postMessage(
        {
          event: 'changePathname',
          pathname: window.location.pathname,
          query: router.query,
        },
        '*',
      );
    }
  });

  if (!currentRouterInstance) {
    currentRouterInstance = router;
  }

  return router;
}

const routerProxy = new Proxy(
  {},
  {
    get(_, prop) {
      return currentRouterInstance?.[prop];
    },
  },
);

export { routes, createInsightsRouter as createRouter };
export default routerProxy;
