import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/insights/Home/index.vue';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
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
