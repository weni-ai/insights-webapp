import type { ConversationalTopicsDistribution } from './topics';
import type { FormattedMetric } from './header';
import type { FormattedContactMetric } from './contacts';
import type {
  CsatResponse,
  NpsResponse,
  SalesFunnelResponse,
  CustomWidgetResponse,
  CrosstabWidgetResponse,
  AutoWidgetResponse,
} from './widgets';
import i18n from '@/utils/plugins/i18n';

const t = (key: string) => i18n.global.t(key);
const mockKey = (path: string) => `conversations_dashboard.mock.${path}`;

export const getMockTopicsDistribution =
  (): ConversationalTopicsDistribution => ({
    topics: [
      {
        label: t(mockKey('topics.delayed_delivery')),
        value: 6973,
        percentage: 29,
        uuid: '',
      },
      {
        label: t(mockKey('topics.defective_product')),
        value: 5500,
        percentage: 23,
        uuid: '',
      },
      {
        label: t(mockKey('topics.price_questions')),
        value: 1600,
        percentage: 16,
        uuid: '',
      },
      {
        label: t(mockKey('topics.cancellation')),
        value: 1400,
        percentage: 14,
        uuid: '',
      },
      {
        label: t(mockKey('topics.unclassified')),
        value: 1000,
        percentage: 13,
        uuid: '',
      },
      {
        label: t(mockKey('topics.others')),
        value: 500,
        percentage: 5,
        uuid: '',
      },
    ],
  });

export const MOCK_HEADER_DATA: FormattedMetric[] = [
  { id: 'total_conversations', value: 24300, percentage: 100 },
  { id: 'resolved', value: 15795, percentage: 65 },
  { id: 'unresolved', value: 4860, percentage: 20 },
  { id: 'transferred_to_human', value: 3645, percentage: 15 },
];

export const MOCK_CONTACTS_DATA: FormattedContactMetric[] = [
  { id: 'unique', value: 80 },
  { id: 'returning', value: 28, percentage: 35 },
  { id: 'avg_conversations_per_contact', value: 1.8 },
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
  promoters: { value: 68, full_value: 680 },
  passives: { value: 20, full_value: 200 },
  detractors: { value: 12, full_value: 120 },
};

export const MOCK_SALES_FUNNEL_DATA: SalesFunnelResponse = {
  captured_leads: { value: 75, full_value: 1200 },
  purchases_made: { value: 32, full_value: 384 },
  total_orders: 384,
  total_value: 47500,
  average_ticket: 123.7,
  currency: 'BRL',
};

export const getMockCustomWidgetData = () =>
  ({
    results: [
      {
        label: t(mockKey('custom_labels.delivered')),
        value: 55,
        full_value: 8470,
      },
      {
        label: t(mockKey('custom_labels.awaiting_payment')),
        value: 15,
        full_value: 2310,
      },
      {
        label: t(mockKey('custom_labels.in_preparation')),
        value: 12,
        full_value: 1848,
      },
      {
        label: t(mockKey('custom_labels.payment_confirmed')),
        value: 10,
        full_value: 1540,
      },
      {
        label: t(mockKey('custom_labels.in_transit')),
        value: 8,
        full_value: 1232,
      },
      {
        label: t(mockKey('custom_labels.returned')),
        value: 5,
        full_value: 770,
      },
    ],
  }) as unknown as CustomWidgetResponse;

export const MOCK_AGENT_INVOCATION_DATA: AutoWidgetResponse = {
  total: 8,
  results: [
    {
      label: 'feedback_recorder_2',
      agent: { uuid: '111-aaa' },
      value: 60,
      full_value: 60,
    },
    {
      label: 'order_status_checker',
      agent: { uuid: '111-aaa' },
      value: 25,
      full_value: 25,
    },
    {
      label: 'payment_processor',
      agent: { uuid: '222-bbb' },
      value: 10,
      full_value: 10,
    },
    {
      label: 'greeting_handler',
      agent: { uuid: '222-bbb' },
      value: 5,
      full_value: 5,
    },
    {
      label: 'feedback_recorder_4',
      agent: { uuid: '111-aaa' },
      value: 60,
      full_value: 60,
    },
    {
      label: 'order_status_checker_5',
      agent: { uuid: '111-aaa' },
      value: 25,
      full_value: 25,
    },
    {
      label: 'payment_processor_6',
      agent: { uuid: '222-bbb' },
      value: 10,
      full_value: 10,
    },
    {
      label: 'greeting_handler_7',
      agent: { uuid: '222-bbb' },
      value: 5,
      full_value: 5,
    },
  ],
};

export const MOCK_TOOL_RESULT_DATA: AutoWidgetResponse = {
  total: 8,
  results: [
    {
      label: 'search_orders',
      agent: { uuid: '111-aaa' },
      value: 45,
      full_value: 45,
    },
    {
      label: 'send_email',
      agent: { uuid: '111-aaa' },
      value: 30,
      full_value: 30,
    },
    {
      label: 'check_inventory',
      agent: { uuid: '222-bbb' },
      value: 15,
      full_value: 15,
    },
    {
      label: 'process_refund',
      agent: { uuid: '222-bbb' },
      value: 10,
      full_value: 10,
    },
  ],
};

export const getMockCrosstabWidgetData = (): CrosstabWidgetResponse => ({
  total_rows: 9,
  results: [
    {
      title: t(mockKey('crosstab_labels.order_status')),
      total: 6000,
      events: {
        [t(mockKey('crosstab_labels.satisfied'))]: {
          value: 72,
          full_value: 4320,
        },
        [t(mockKey('crosstab_labels.dissatisfied'))]: {
          value: 28,
          full_value: 1680,
        },
      },
    },
    {
      title: t(mockKey('crosstab_labels.product_inquiries')),
      total: 5520,
      events: {
        [t(mockKey('crosstab_labels.satisfied'))]: {
          value: 65,
          full_value: 3588,
        },
        [t(mockKey('crosstab_labels.dissatisfied'))]: {
          value: 35,
          full_value: 1932,
        },
      },
    },
    {
      title: t(mockKey('crosstab_labels.payments')),
      total: 5200,
      events: {
        [t(mockKey('crosstab_labels.satisfied'))]: {
          value: 60,
          full_value: 3120,
        },
        [t(mockKey('crosstab_labels.dissatisfied'))]: {
          value: 40,
          full_value: 2080,
        },
      },
    },
    {
      title: t(mockKey('crosstab_labels.technical_support')),
      total: 4000,
      events: {
        [t(mockKey('crosstab_labels.satisfied'))]: {
          value: 40,
          full_value: 1600,
        },
        [t(mockKey('crosstab_labels.dissatisfied'))]: {
          value: 60,
          full_value: 2400,
        },
      },
    },
    {
      title: t(mockKey('crosstab_labels.shipping_info')),
      total: 1200,
      events: {
        [t(mockKey('crosstab_labels.satisfied'))]: {
          value: 58,
          full_value: 696,
        },
        [t(mockKey('crosstab_labels.dissatisfied'))]: {
          value: 42,
          full_value: 504,
        },
      },
    },
  ],
});
