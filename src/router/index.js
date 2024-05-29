import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/insights/Dashboard.vue';
import routes from './routes';

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
      props: (route) => ({
        startDate: route.query.startDate,
        endDate: route.query.endDate,
      }),
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
    ...routes,
  ],
});

export default router;
