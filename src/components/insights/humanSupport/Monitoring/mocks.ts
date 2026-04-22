const monitoringStatusCardsMock = {
  finished: 82,
  in_progress: 32,
  is_waiting: 14,
};

const monitoringTimeMetricsMock = {
  average_time_is_waiting: { average: 40, max: 105 },
  average_time_first_response: { average: 72, max: 143 },
  average_time_chat: { average: 1710, max: 2423 },
};

const monitoringPeaksInHumanServiceMock = [
  {
    label: '0h',
    value: 0,
  },
  {
    label: '1h',
    value: 0,
  },
  {
    label: '2h',
    value: 0,
  },
  {
    label: '3h',
    value: 0,
  },
  {
    label: '4h',
    value: 0,
  },
  {
    label: '5h',
    value: 0,
  },
  {
    label: '6h',
    value: 0,
  },
  {
    label: '7h',
    value: 0,
  },
  {
    label: '8h',
    value: 5,
  },
  {
    label: '9h',
    value: 23,
  },
  {
    label: '10h',
    value: 32,
  },
  {
    label: '11h',
    value: 34,
  },
  {
    label: '12h',
    value: 36,
  },
  {
    label: '13h',
    value: 26,
  },
  {
    label: '14h',
    value: 0,
  },
  {
    label: '15h',
    value: 0,
  },
  {
    label: '16h',
    value: 0,
  },
  {
    label: '17h',
    value: 0,
  },
  {
    label: '18h',
    value: 0,
  },
  {
    label: '19h',
    value: 0,
  },
  {
    label: '20h',
    value: 0,
  },
  {
    label: '21h',
    value: 0,
  },
  {
    label: '22h',
    value: 0,
  },
  {
    label: '23h',
    value: 0,
  },
];

const monitoringCsatTotalsMock = {
  rooms: 82,
  reviews: 40,
  avg_rating: 4.35,
};

const monitoringCsatAgentsMock = [
  {
    agent: {
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      is_deleted: false,
    },
    rooms: 9,
    reviews: 9,
    avg_rating: 4.9,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Bruno Lima',
      email: 'bruno.lima@email.com',
      is_deleted: false,
    },
    rooms: 9,
    reviews: 9,
    avg_rating: 4.6,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Camila Rocha',
      email: 'camila.rocha@email.com',
      is_deleted: false,
    },
    rooms: 8,
    reviews: 7,
    avg_rating: 4.1,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Diego Alves',
      email: 'diego.alves@email.com',
      is_deleted: false,
    },
    rooms: 8,
    reviews: 6,
    avg_rating: 4.0,
    is_deleted: false,
  },
];

const monitoringCsatRatingsMock = {
  '5': { value: 50, full_value: 20 },
  '4': { value: 27.5, full_value: 11 },
  '3': { value: 12.5, full_value: 5 },
  '2': { value: 7.5, full_value: 3 },
  '1': { value: 2.5, full_value: 1 },
};

const monitoringDetailedMonitoringInProgressMock = [
  {
    agent: 'Ana Costa',
    duration: 135,
    awaiting_time: 45,
    first_response_time: 12,
    sector: 'Logistics',
    queue: 'Tracking',
    contact: 'Maria Oliveira',
    urn: '9821',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Bruno Lima',
    duration: 774,
    awaiting_time: 750,
    first_response_time: 70,
    sector: 'Finance',
    queue: 'Payments',
    contact: 'João Santos',
    urn: '4412',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Camila Rocha',
    duration: 910,
    awaiting_time: 135,
    first_response_time: 45,
    sector: 'Pre-Sales',
    queue: 'Product inquiry',
    contact: 'Roberto',
    urn: '1109',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Diego Alves',
    duration: 954,
    awaiting_time: 80,
    first_response_time: 40,
    sector: 'Logistics',
    queue: 'Tracking',
    contact: 'Patricia Lima',
    urn: '0051',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Diego Souza',
    duration: 932,
    awaiting_time: 320,
    first_response_time: 10,
    sector: 'Retention',
    queue: 'VIP support',
    contact: 'Felipe Alencar',
    urn: '8872',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Diego Souza',
    duration: 1441,
    awaiting_time: 265,
    first_response_time: 150,
    sector: 'Retention',
    queue: 'VIP support',
    contact: 'Aline Moraes',
    urn: '2234',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Ana Costa',
    duration: 1510,
    awaiting_time: 948,
    first_response_time: 20,
    sector: 'Logistics',
    queue: 'Tracking',
    contact: 'Vinicius',
    urn: '6610',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Diego Alves',
    duration: 1572,
    awaiting_time: 902,
    first_response_time: 75,
    sector: 'Logistics',
    queue: 'Tracking',
    contact: 'Camila Dutra',
    urn: '1150',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Ricardo Silva',
    duration: 2110,
    awaiting_time: 301,
    first_response_time: 56,
    sector: 'Finance',
    queue: 'Payments',
    contact: 'Lucas Pereira',
    urn: '4500',
    link: {
      url: '',
      type: 'internal',
    },
  },
  {
    agent: 'Camila Rocha',
    duration: 2172,
    awaiting_time: 303,
    first_response_time: 40,
    sector: 'Pre-Sales',
    queue: 'Product inquiry',
    contact: 'Beatriz',
    urn: '6655',
    link: {
      url: '',
      type: 'internal',
    },
  },
];

const monitoringVolumePerQueueMock = [
  {
    sector_name: 'Logistics',
    queues: [{ queue_name: 'Tracking', value: 12 }],
  },
  {
    sector_name: 'After-Saçes',
    queues: [{ queue_name: 'Returns', value: 8 }],
  },
  {
    sector_name: 'Pre-Sales',
    queues: [{ queue_name: 'Product inquiry', value: 7 }],
  },
  {
    sector_name: 'Finance',
    queues: [{ queue_name: 'Payments', value: 3 }],
  },
  {
    sector_name: 'Retention',
    queues: [{ queue_name: 'VIP support', value: 2 }],
  },
];

const monitoringVolumePerQueueMockItemsCount = 8;

const monitoringVolumePerTagMock = [
  {
    sector_name: 'Logistics',
    tags: [{ tag_name: 'ShippingDelay', value: 10 }],
  },
  {
    sector_name: 'Doubts',
    tags: [{ tag_name: 'SizeGuide', value: 6 }],
  },
  {
    sector_name: 'Pre-Sales',
    tags: [{ tag_name: 'PromoCode', value: 5 }],
  },
  {
    sector_name: 'After-Sales',
    tags: [{ tag_name: 'DefectiveItem', value: 4 }],
  },
  {
    sector_name: 'Logistics',
    tags: [{ tag_name: 'AddressChange', value: 3 }],
  },
];

const monitoringVolumePerTagMockItemsCount = 8;

export {
  monitoringStatusCardsMock,
  monitoringTimeMetricsMock,
  monitoringPeaksInHumanServiceMock,
  monitoringCsatTotalsMock,
  monitoringCsatAgentsMock,
  monitoringCsatRatingsMock,
  monitoringDetailedMonitoringInProgressMock,
  monitoringVolumePerQueueMock,
  monitoringVolumePerTagMock,
  monitoringVolumePerQueueMockItemsCount,
  monitoringVolumePerTagMockItemsCount,
};
