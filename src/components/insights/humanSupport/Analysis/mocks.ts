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
    agent: { name: 'Ana Costa', email: 'ana.costa@email.com' },
    rooms: 850,
    reviews: 620,
    avg_rating: 4.8,
  },
  {
    agent: { name: 'Bruno Lima', email: 'bruno.lima@email.com' },
    rooms: 810,
    reviews: 590,
    avg_rating: 4.8,
  },
  {
    agent: { name: 'Camila Rocha', email: 'camila.rocha@email.com' },
    rooms: 795,
    reviews: 580,
    avg_rating: 4.7,
  },
  {
    agent: { name: 'Diego Alves', email: 'diego.alves@email.com' },
    rooms: 760,
    reviews: 510,
    avg_rating: 4.5,
  },
];

const analysisCsatRatingsMock = {
  '5': { value: 68, full_value: 8364 },
  '4': { value: 18, full_value: 2214 },
  '3': { value: 8, full_value: 984 },
  '2': { value: 4, full_value: 492 },
  '1': { value: 2, full_value: 246 },
};

export {
  analysisStatusCardsMock,
  analysisPeaksInHumanServiceMock,
  analysisCsatTotalsMock,
  analysisCsatAgentsMock,
  analysisCsatRatingsMock,
};
