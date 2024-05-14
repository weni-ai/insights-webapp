import DashboardHumanService from '@/views/dashboards/HumanService.vue';
import FlowTrigger from '@/views/dashboards/Dashboard/FlowTrigger.vue';

export default [
  {
    path: '/dashboards',
    redirect: '/',
    props: (route) => ({
      dateStart: route.query.dateStart,
      dateEnd: route.query.dateEnd,
    }),
  },
  {
    path: '/human-service',
    component: DashboardHumanService,
    name: 'human-service',
    props: (route) => ({
      dateStart: route.query.dateStart,
      dateEnd: route.query.dateEnd,
      contact: route.query.contact,
      sector: route.query.sector,
      queue: route.query.queue,
      agent: route.query.agent,
      tags: route.query.tags,
    }),
  },
  {
    path: '/triggered-flows',
    name: 'triggered-flows',
    component: FlowTrigger,
  },
];
