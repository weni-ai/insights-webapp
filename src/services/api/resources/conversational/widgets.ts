import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';
import { asyncTimeout } from '@/utils/time';

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

    // TODO: remove mock

    // const response = await http.get('/metrics/conversations/crosstab/', {
    //   params,
    // });

    await asyncTimeout(5000);

    const response = {
      total_rows: 6,
      results: [
        {
          title: 'Delivery1',
          total: 6000,
          events: {
            satisfied: {
              value: 85.0, // percentage
            },
            dissatisfied: {
              value: 15.0, // percentage
            },
          },
        },
        {
          title: 'Delivery2',
          total: 6000,
          events: {
            satisfied: {
              value: 80.0, // percentage
            },
            dissatisfied: {
              value: 20.0, // percentage
            },
          },
        },
        {
          title: 'Delivery3',
          total: 6000,
          events: {
            satisfied: {
              value: 75.5, // percentage
            },
            dissatisfied: {
              value: 24.5, // percentage
            },
          },
        },
        {
          title: 'Delivery4',
          total: 6000,
          events: {
            satisfied: {
              value: 85.0, // percentage
            },
            dissatisfied: {
              value: 15.0, // percentage
            },
          },
        },
        {
          title: 'Delivery5',
          total: 6000,
          events: {
            satisfied: {
              value: 85.0, // percentage
            },
            dissatisfied: {
              value: 15.0, // percentage
            },
          },
        },
        {
          title: 'Delivery6',
          total: 6000,
          events: {
            satisfied: {
              value: 85.0, // percentage
            },
            dissatisfied: {
              value: 15.0, // percentage
            },
          },
        },
      ],
    };

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
  CrosstabWidgetResponse,
  CrosstabResultItem,
};
