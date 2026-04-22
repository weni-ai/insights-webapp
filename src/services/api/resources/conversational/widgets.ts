import http from '@/services/api/http';
import http2 from '@/services/api/http2';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';
import { MOCK_CSAT_DATA, MOCK_NPS_DATA, MOCK_SALES_FUNNEL_DATA } from './mocks';

type CsatLabel = '1' | '2' | '3' | '4' | '5';

interface ValueWithFullValue {
  value: number;
  full_value: number;
}

interface CsatResult {
  label: CsatLabel;
  value: number;
  full_value: number;
}
interface CsatResponse {
  results: CsatResult[];
}

interface CustomWidgetResponse {
  results: CsatResult[];
}

interface CrosstabResultItem {
  title: string;
  total: number;
  events: { [key: string]: { value: number; full_value: number } };
}

interface CrosstabWidgetResponse {
  total_rows: number;
  results: CrosstabResultItem[];
}

interface NpsResponse {
  score: number;
  total_responses: number;
  promoters: ValueWithFullValue;
  passives: ValueWithFullValue;
  detractors: ValueWithFullValue;
}

interface SalesFunnelResponse {
  captured_leads: ValueWithFullValue;
  purchases_made: ValueWithFullValue;
  total_orders: number;
  total_value: number;
  average_ticket: number;
  currency: string;
}

interface AutoWidgetResult {
  label: string;
  agent: { uuid: string };
  value: number;
  full_value: number;
}

interface AutoWidgetResponse {
  total: number;
  results: AutoWidgetResult[];
}

interface WidgetQueryParams {
  start_date?: string;
  end_date?: string;
  widget_uuid: string;
  project_uuid?: string;
}

interface AbsoluteNumbersChildrenResponse {
  next: string | null;
  previous: string | null;
  results: AbsoluteNumbersChildrenItem[];
}

interface AbsoluteNumbersChildrenItem {
  uuid: string;
  parent: string;
  name: string;
  config: {
    index: number;
    agent_uuid: string;
    key: string;
    operation: string;
    value_field_name: string;
    currency: {
      is_active: boolean;
      code: string | null;
    };
  };
}
// eslint-disable-next-line no-unused-vars
enum AvailableWidget {
  // eslint-disable-next-line no-unused-vars
  SALES_FUNNEL = 'SALES_FUNNEL',
}

interface AvailableWidgetsQueryParams {
  project_uuid?: string;
  type?: 'NATIVE' | 'CUSTOM';
}

interface AvailableWidgetsResponse {
  available_widgets: AvailableWidget[];
}

export default {
  async getCsatData(
    type: 'HUMAN' | 'AI',
    queryParams: Partial<WidgetQueryParams> = {},
    options: { mock?: boolean; signal?: AbortSignal } = {},
  ): Promise<CsatResponse> {
    if (options.mock) return MOCK_CSAT_DATA;

    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      type,
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/csat/', {
      params,
      signal: options.signal,
    })) as CsatResponse;

    return response;
  },

  async getNpsData(
    type: 'HUMAN' | 'AI',
    queryParams: Partial<WidgetQueryParams> = {},
    options: { mock?: boolean; signal?: AbortSignal } = {},
  ): Promise<NpsResponse> {
    if (options.mock) return MOCK_NPS_DATA;

    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      type,
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http2.get('/metrics/conversations/nps/', {
      params,
      signal: options.signal,
    })) as NpsResponse;

    return response;
  },

  async getCustomWidgetData(
    queryParams: WidgetQueryParams,
    options: { signal?: AbortSignal } = {},
  ): Promise<CustomWidgetResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/custom/', {
      params,
      signal: options.signal,
    })) as CustomWidgetResponse;

    return response;
  },

  async getCrosstabWidgetData(
    queryParams: WidgetQueryParams,
    options: { signal?: AbortSignal } = {},
  ): Promise<any> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/crosstab/', {
      params,
      signal: options.signal,
    })) as CrosstabWidgetResponse;

    const sortedResponse = {
      total_rows: response.total_rows,
      results: response.results?.sort((a, b) => b.total - a.total) || [],
    };

    return sortedResponse;
  },

  async getSalesFunnelData(
    queryParams: Partial<WidgetQueryParams> = {},
    options: { mock?: boolean; signal?: AbortSignal } = {},
  ): Promise<SalesFunnelResponse> {
    if (options.mock) return MOCK_SALES_FUNNEL_DATA;

    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: queryParams.project_uuid || project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/sales_funnel/', {
      params,
      signal: options.signal,
    })) as SalesFunnelResponse;

    return response;
  },

  async getAvailableWidgets(
    queryParams: AvailableWidgetsQueryParams,
  ): Promise<AvailableWidgetsResponse> {
    const { project } = useConfig();

    const params = {
      project_uuid: queryParams.project_uuid || project.uuid,
      ...(queryParams.type && { type: queryParams.type }),
    };

    const response = (await http.get(
      '/metrics/conversations/available-widgets/',
      {
        params,
      },
    )) as AvailableWidgetsResponse;

    return response;
  },

  async getAbsoluteNumbersChildren(
    widgetUuid: string,
  ): Promise<AbsoluteNumbersChildrenResponse> {
    const response = (await http.get(
      `/widgets/${widgetUuid}/children/`,
    )) as AbsoluteNumbersChildrenResponse;

    return response;
  },

  async getAbsoluteNumbersChildrenValue(
    widgetUuid: string,
    options: { signal?: AbortSignal } = {},
  ): Promise<{ value: number }> {
    const { appliedFilters } = useConversational();
    const params = {
      widget_uuid: widgetUuid,
      ...appliedFilters,
    };
    const response = (await http.get(
      `/metrics/conversations/absolute-numbers/`,
      { params, signal: options.signal },
    )) as { value: number };

    return response;
  },

  async getAgentInvocationData(
    queryParams: Partial<WidgetQueryParams> = {},
    options: { signal?: AbortSignal } = {},
  ): Promise<AutoWidgetResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get(
      '/metrics/conversations/agent-invocation/',
      { params, signal: options.signal },
    )) as AutoWidgetResponse;

    return response;
  },

  async getToolResultData(
    queryParams: Partial<WidgetQueryParams> = {},
    options: { signal?: AbortSignal } = {},
  ): Promise<AutoWidgetResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/tool-result/', {
      params,
      signal: options.signal,
    })) as AutoWidgetResponse;

    return response;
  },
};

export { AvailableWidget };

export type {
  CsatResponse,
  NpsResponse,
  WidgetQueryParams,
  CsatResult,
  CustomWidgetResponse,
  SalesFunnelResponse,
  CrosstabWidgetResponse,
  CrosstabResultItem,
  AvailableWidgetsQueryParams,
  AvailableWidgetsResponse,
  AbsoluteNumbersChildrenResponse,
  AbsoluteNumbersChildrenItem,
  AutoWidgetResult,
  AutoWidgetResponse,
};
