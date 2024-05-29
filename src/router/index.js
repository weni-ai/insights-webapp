import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/insights/Home/index.vue';
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
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    ...routes,
  ],
});

export default router;
