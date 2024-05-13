import DashboardHumanService from '@/views/dashboards/HumanService.vue';
import FlowTrigger from '@/views/dashboards/Dashboard/FlowTrigger.vue';

export default [
  {
    path: '/dashboards',
    redirect: '/',
    props: (route) => ({
      startDate: route.query.startDate,
      endDate: route.query.endDate,
    }),
  },
  {
    path: '/human-service',
    component: DashboardHumanService,
    name: 'human-service',
    props: (route) => ({
      startDate: route.query.startDate,
      endDate: route.query.endDate,
    }),
  },
  {
    path: '/dashboards/flow-trigger',
    name: 'flow',
    component: FlowTrigger,
  },
];
