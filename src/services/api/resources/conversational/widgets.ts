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

interface CrosstabResultItem {
  title: string;
  total: number;
  events: { [key: string]: { value: number } };
}

interface CrosstabWidgetResponse {
  total_rows: number;
  results: CrosstabResultItem[];
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

  async getCrosstabWidgetData(queryParams: WidgetQueryParams): Promise<any> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...queryParams,
    };

    const response = (await http.get('/metrics/conversations/crosstab/', {
      params,
    })) as CrosstabWidgetResponse;

    const sortedResponse = {
      total_rows: response.total_rows,
      results: response.results?.sort((a, b) => b.total - a.total) || [],
    };

    return sortedResponse;
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
};
