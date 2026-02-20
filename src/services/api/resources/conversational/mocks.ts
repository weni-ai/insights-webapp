import type { ConversationalTopicsDistribution } from './topics';
import type { CsatResponse, NpsResponse, SalesFunnelResponse } from './widgets';

export const MOCK_TOPICS_DISTRIBUTION: ConversationalTopicsDistribution = {
  topics: [
    {
      label: 'Entrega atrasada',
      value: 6973,
      percentage: 29,
      uuid: '',
    },
    {
      label: 'Produto defeituoso',
      value: 5500,
      percentage: 23,
      uuid: '',
    },
    {
      label: 'Dúvidas sobre preço',
      value: 1600,
      percentage: 16,
      uuid: '',
    },
    {
      label: 'Cancelamento',
      value: 1400,
      percentage: 14,
      uuid: '',
    },
    {
      label: 'Unclassified',
      value: 1000,
      percentage: 13,
      uuid: '',
    },
    {
      label: 'Outros',
      value: 500,
      percentage: 5,
      uuid: '',
    },
  ],
};

export const MOCK_CSAT_DATA: CsatResponse = {
  results: [
    { label: '5', value: 45, full_value: 450 },
    { label: '4', value: 30, full_value: 300 },
    { label: '3', value: 15, full_value: 150 },
    { label: '2', value: 7, full_value: 70 },
    { label: '1', value: 3, full_value: 30 },
  ],
};

export const MOCK_NPS_DATA: NpsResponse = {
  score: 62,
  total_responses: 1000,
  promoters: 68,
  passives: 20,
  detractors: 12,
};

export const MOCK_SALES_FUNNEL_DATA: SalesFunnelResponse = {
  captured_leads: { value: 75, full_value: 1200 },
  purchases_made: { value: 32, full_value: 384 },
  total_orders: 384,
  total_value: 47500,
  average_ticket: 123.7,
  currency: 'BRL',
};
