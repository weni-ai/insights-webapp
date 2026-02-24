import type { ConversationalTopicsDistribution } from './topics';
import type { FormattedMetric } from './header';
import type {
  CsatResponse,
  NpsResponse,
  SalesFunnelResponse,
  CustomWidgetResponse,
  CrosstabWidgetResponse,
} from './widgets';

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

export const MOCK_HEADER_DATA: FormattedMetric[] = [
  { id: 'total_conversations', value: 24300, percentage: 100 },
  { id: 'resolved', value: 15795, percentage: 65 },
  { id: 'unresolved', value: 4860, percentage: 20 },
  { id: 'transferred_to_human', value: 3645, percentage: 15 },
];

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

export const MOCK_CUSTOM_WIDGET_DATA = {
  results: [
    { label: 'Delivered', value: 55, full_value: 8470 },
    { label: 'Awaiting payment', value: 15, full_value: 2310 },
    { label: 'In preparation', value: 12, full_value: 1848 },
    { label: 'Payment confirmed', value: 10, full_value: 1540 },
    { label: 'In transit', value: 8, full_value: 1232 },
    { label: 'Returned', value: 5, full_value: 770 },
  ],
} as unknown as CustomWidgetResponse;

export const MOCK_CROSSTAB_WIDGET_DATA: CrosstabWidgetResponse = {
  total_rows: 9,
  results: [
    {
      title: 'Order status',
      total: 6000,
      events: {
        satisfied: { value: 72, full_value: 4320 },
        dissatisfied: { value: 28, full_value: 1680 },
      },
    },
    {
      title: 'Product inquiries',
      total: 5520,
      events: {
        satisfied: { value: 65, full_value: 3588 },
        dissatisfied: { value: 35, full_value: 1932 },
      },
    },
    {
      title: 'Payments',
      total: 5200,
      events: {
        satisfied: { value: 60, full_value: 3120 },
        dissatisfied: { value: 40, full_value: 2080 },
      },
    },
    {
      title: 'Technical support',
      total: 4000,
      events: {
        satisfied: { value: 40, full_value: 1600 },
        dissatisfied: { value: 60, full_value: 2400 },
      },
    },
    {
      title: 'Shipping info',
      total: 1200,
      events: {
        satisfied: { value: 58, full_value: 696 },
        dissatisfied: { value: 42, full_value: 504 },
      },
    },
  ],
};
