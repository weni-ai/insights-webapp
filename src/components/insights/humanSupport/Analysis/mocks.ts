const analysisStatusCardsMock = {
  average_time_is_waiting: 45,
  average_time_first_response: 72,
  average_response_time: 125,
  average_time_chat: 2070,
  finished: 18452,
};

const analysisPeaksInHumanServiceMock = [
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
    value: 2100,
  },
  {
    label: '8h',
    value: 2050,
  },
  {
    label: '9h',
    value: 2000,
  },
  {
    label: '10h',
    value: 2050,
  },
  {
    label: '11h',
    value: 2080,
  },
  {
    label: '12h',
    value: 2100,
  },
  {
    label: '13h',
    value: 2200,
  },
  {
    label: '14h',
    value: 2080,
  },
  {
    label: '15h',
    value: 2030,
  },
  {
    label: '16h',
    value: 1900,
  },
  {
    label: '17h',
    value: 1850,
  },
  {
    label: '18h',
    value: 1700,
  },
  {
    label: '19h',
    value: 1580,
  },
  {
    label: '20h',
    value: 1200,
  },
  {
    label: '21h',
    value: 700,
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

const analysisCsatTotalsMock = {
  rooms: 18452,
  reviews: 12300,
  avg_rating: 4.7,
};

const analysisCsatAgentsMock = [
  {
    agent: {
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      is_deleted: false,
    },
    rooms: 850,
    reviews: 620,
    avg_rating: 4.8,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Bruno Lima',
      email: 'bruno.lima@email.com',
      is_deleted: false,
    },
    rooms: 810,
    reviews: 590,
    avg_rating: 4.8,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Camila Rocha',
      email: 'camila.rocha@email.com',
      is_deleted: false,
    },
    rooms: 795,
    reviews: 580,
    avg_rating: 4.7,
    is_deleted: false,
  },
  {
    agent: {
      name: 'Diego Alves',
      email: 'diego.alves@email.com',
      is_deleted: false,
    },
    rooms: 760,
    reviews: 510,
    avg_rating: 4.5,
    is_deleted: false,
  },
];

const analysisCsatRatingsMock = {
  '5': { value: 68, full_value: 8364 },
  '4': { value: 18, full_value: 2214 },
  '3': { value: 8, full_value: 984 },
  '2': { value: 4, full_value: 492 },
  '1': { value: 2, full_value: 246 },
};

const analysisDetailedAnalysisFinishedMock = [
  {
    agent: 'Ana Costa',
    sector: 'Logistics',
    queue: 'Order status',
    awaiting_time: 32,
    first_response_time: 55,
    response_time: 105,
    duration: 730,
    contact: 'Heitor Barbosa',
    ticket_id: '9021',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Ana Costa',
    sector: 'Logistics',
    queue: 'Order status',
    awaiting_time: 75,
    first_response_time: 90,
    response_time: 130,
    duration: 525,
    contact: 'Anna',
    ticket_id: '9022',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Ana Costa',
    sector: 'Logistics',
    queue: 'Order status',
    awaiting_time: 55,
    first_response_time: 45,
    response_time: 160,
    duration: 1100,
    contact: 'Taylor',
    ticket_id: '9023',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Bruno Lima',
    sector: 'Finance',
    queue: 'Payments',
    awaiting_time: 90,
    first_response_time: 130,
    response_time: 195,
    duration: 1550,
    contact: 'James',
    ticket_id: '9024',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Bruno Lima',
    sector: 'Finance',
    queue: 'Payments',
    awaiting_time: 70,
    first_response_time: 20,
    response_time: 80,
    duration: 330,
    contact: 'Michael Lisboa',
    ticket_id: '9025',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Camila Rocha',
    sector: 'Pre-Sales',
    queue: 'Product inquiry',
    awaiting_time: 165,
    first_response_time: 65,
    response_time: 140,
    duration: 555,
    contact: 'William',
    ticket_id: '9026',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Camila Rocha',
    sector: 'Pre-Sales',
    queue: 'Product inquiry',
    awaiting_time: 40,
    first_response_time: 50,
    response_time: 135,
    duration: 880,
    contact: 'Thomas',
    ticket_id: '9027',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Camila Rocha',
    sector: 'Pre-Sales',
    queue: 'Product inquiry',
    awaiting_time: 75,
    first_response_time: 35,
    response_time: 341,
    duration: 970,
    contact: 'Laura Garcia',
    ticket_id: '9028',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Diego Alves',
    sector: 'Logistics',
    queue: 'Order status',
    awaiting_time: 65,
    first_response_time: 101,
    response_time: 75,
    duration: 330,
    contact: 'David',
    ticket_id: '9030',
    link: { url: '', type: 'internal' },
  },
  {
    agent: 'Diego Alves',
    sector: 'Logistics',
    queue: 'Order status',
    awaiting_time: 80,
    first_response_time: 138,
    response_time: 72,
    duration: 2459,
    contact: 'Emily',
    ticket_id: '9031',
    link: { url: '', type: 'internal' },
  },
];

const analysisVolumePerQueueMock = [
  {
    sector_name: 'Logistics',
    queues: [{ queue_name: 'Order status', value: 5100 }],
  },
  {
    sector_name: 'After-Saçes',
    queues: [{ queue_name: 'Returns', value: 6000 }],
  },
  {
    sector_name: 'Pre-Sales',
    queues: [{ queue_name: 'Product inquiry', value: 1980 }],
  },
  {
    sector_name: 'Finance',
    queues: [{ queue_name: 'Payments', value: 3450 }],
  },
  {
    sector_name: 'Customer relations',
    queues: [{ queue_name: 'Complaints', value: 1062 }],
  },
];

const analysisVolumePerQueueMockItemsCount = 7;

const analysisVolumePerTagMock = [
  {
    sector_name: 'Campaigns',
    tags: [{ tag_name: 'BlackFriday', value: 7000 }],
  },
  {
    sector_name: 'Logistics',
    tags: [{ tag_name: 'CarrierDelay', value: 4500 }],
  },
  {
    sector_name: 'Financial',
    tags: [{ tag_name: 'Refund', value: 3100 }],
  },
  {
    sector_name: 'Retention',
    tags: [{ tag_name: 'VIPCustomer', value: 2000 }],
  },
  {
    sector_name: 'Conversion',
    tags: [{ tag_name: 'AbandonedCart', value: 800 }],
  },
];

const analysisVolumePerTagMockItemsCount = 10;

export {
  analysisStatusCardsMock,
  analysisPeaksInHumanServiceMock,
  analysisCsatTotalsMock,
  analysisCsatAgentsMock,
  analysisCsatRatingsMock,
  analysisDetailedAnalysisFinishedMock,
  analysisVolumePerQueueMock,
  analysisVolumePerTagMock,
  analysisVolumePerQueueMockItemsCount,
  analysisVolumePerTagMockItemsCount,
};
