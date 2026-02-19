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

export {
  monitoringStatusCardsMock,
  monitoringTimeMetricsMock,
  monitoringPeaksInHumanServiceMock,
};
