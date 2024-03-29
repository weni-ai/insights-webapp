import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import Home from '@/views/insights/Home/index.vue';
import Dashboards from '@/views/dashboards/Home/index.vue';
import Dashboard from '@/views/dashboards/Dashboard/index.vue';
import FlowTrigger from '@/views/dashboards/Dashboard/FlowTrigger.vue';

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
    {
      path: '/dashboards',
      name: 'dashboards',
      component: Dashboards,
    },
    {
      path: '/dashboards/:id',
      component: Dashboard,
      name: 'dashboard',
      props: (route) => ({
        cardId: route.params.cardId,
      }),
    },
    {
      path: '/dashboards/flow-trigger',
      name: 'flow',
      component: FlowTrigger,
    },
  ],
});

export default router;

router.beforeEach((to, from, next) => {
  if (to.name !== 'home') {
    store.dispatch('sidebar/updateChartVisibility', false);
  }
  next();
});
