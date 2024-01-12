import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/insights/Home/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      beforeEnter: (from, to, next) => {
        if (to.path === '/') next({ name: 'home', replace: true });
        else next(to.path);
      },
    },
    {
      path: '/insights',
      name: 'home',
      component: Home,
    },
  ],
});

export default router;
