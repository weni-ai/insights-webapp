import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

interface CTWADataApiResponse {
  attributed_revenue: {
    value: number;
    avg: number;
  };
  ctwa_conversations?: number;
  ctwa_conversaAtions?: number;
  organic_conversations: number;
}

export interface CTWADashboardData {
  attributed_revenue: {
    value: number | null;
    avg: number | null;
  };
  ctwa_conversations: number | null;
  organic_conversations: number | null;
}

interface QueryParams {
  start_date?: string;
  end_date?: string;
}

export default {
  async getDashboardData(
    queryParams: QueryParams = {},
  ): Promise<CTWADashboardData> {
    const { project } = useConfig();
    const { appliedDateRange } = useCTWA();

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
      ...params,
    };

    const response = (await http.get(`/projects/${project.uuid}/ctwa/data/`, {
      params: formattedParams,
    })) as CTWADataApiResponse;

    return {
      attributed_revenue: {
        value: response.attributed_revenue?.value ?? null,
        avg: response.attributed_revenue?.avg ?? null,
      },
      ctwa_conversations:
        response.ctwa_conversations ?? response.ctwa_conversaAtions ?? null,
      organic_conversations: response.organic_conversations ?? null,
    };
  },
};

export type { QueryParams };
