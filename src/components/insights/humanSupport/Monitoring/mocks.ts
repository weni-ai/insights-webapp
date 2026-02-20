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
    agent: { name: 'Ana Costa', email: 'ana.costa@email.com' },
    rooms: 9,
    reviews: 9,
    avg_rating: 4.9,
  },
  {
    agent: { name: 'Bruno Lima', email: 'bruno.lima@email.com' },
    rooms: 9,
    reviews: 9,
    avg_rating: 4.6,
  },
  {
    agent: { name: 'Camila Rocha', email: 'camila.rocha@email.com' },
    rooms: 8,
    reviews: 7,
    avg_rating: 4.1,
  },
  {
    agent: { name: 'Diego Alves', email: 'diego.alves@email.com' },
    rooms: 8,
    reviews: 6,
    avg_rating: 4.0,
  },
];

const monitoringCsatRatingsMock = {
  '5': { value: 50, full_value: 20 },
  '4': { value: 27.5, full_value: 11 },
  '3': { value: 12.5, full_value: 5 },
  '2': { value: 7.5, full_value: 3 },
  '1': { value: 2.5, full_value: 1 },
};

export {
  monitoringStatusCardsMock,
  monitoringTimeMetricsMock,
  monitoringPeaksInHumanServiceMock,
  monitoringCsatTotalsMock,
  monitoringCsatAgentsMock,
  monitoringCsatRatingsMock,
};
