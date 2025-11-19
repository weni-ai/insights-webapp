import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
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
  if (!isFederatedModule) {
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

export { routes };
export default router;
