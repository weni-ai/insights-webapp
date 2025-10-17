import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';

type CsatLabel = '1' | '2' | '3' | '4' | '5';

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

interface NpsResponse {
  score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
}

interface SalesFunnelResponse {
  captured_leads: {
    value: number;
    full_value: number;
  };
  purchases_made: {
    value: number;
    full_value: number;
  };
  total_orders: number;
  total_value: number;
  average_ticket: number;
  currency: string;
}

interface WidgetQueryParams {
  start_date?: string;
  end_date?: string;
  widget_uuid: string;
  project_uuid?: string;
}

export default {
  async getCsatData(
    type: 'HUMAN' | 'AI',
    queryParams: WidgetQueryParams,
  ): Promise<CsatResponse> {
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
    })) as CsatResponse;

    return response;
  },

  async getNpsData(
    type: 'HUMAN' | 'AI',
    queryParams: WidgetQueryParams,
  ): Promise<NpsResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      type,
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/nps/', {
      params,
    })) as NpsResponse;

    return response;
  },

  async getCustomWidgetData(
    queryParams: WidgetQueryParams,
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
    })) as CustomWidgetResponse;

    return response;
  },

  async getSalesFunnelData(
    queryParams: WidgetQueryParams,
  ): Promise<SalesFunnelResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: queryParams.project_uuid || project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/sales_funnel/', {
      params,
    })) as SalesFunnelResponse;

    return response;
  },
};

export type {
  CsatResponse,
  NpsResponse,
  WidgetQueryParams,
  CsatResult,
  CustomWidgetResponse,
  SalesFunnelResponse,
};
