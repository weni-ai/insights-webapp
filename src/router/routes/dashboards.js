import DashboardHumanService from '@/views/dashboards/HumanService.vue';
import DashboardFlowResults from '@/views/dashboards/FlowResults.vue';

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
    children: [
      {
        path: 'peak-chats',
        name: 'peak-chats',
        component: DashboardHumanService,
      },
    ],
  },
  {
    path: '/flow-results',
    name: 'flow-results',
    component: DashboardFlowResults,
  },
];
