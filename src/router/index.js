import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import Home from '@/views/insights/Home/index.vue';
import DashboardHumanService from '@/views/dashboards/HumanService.vue';
import FlowTrigger from '@/views/dashboards/Dashboard/FlowTrigger.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      beforeEnter: (to, from, next) => {
        if (to.path === '/') {
          next({ name: 'home', replace: true });
        } else {
          next();
        }
      },
    },
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/dashboards',
      redirect: '/',
    },
    {
      path: '/human-service',
      component: DashboardHumanService,
      name: 'human-service',
    },
    {
      path: '/dashboards/flow-trigger',
      name: 'flow',
      component: FlowTrigger,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
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
