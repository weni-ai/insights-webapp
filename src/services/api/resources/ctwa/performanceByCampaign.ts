import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

export interface CampaignPerformanceRow {
  campaign: string | null;
  conversations: number | null;
  qualified: number | null;
  conversions: number | null;
  revenue: number | null;
}

export interface CampaignPerformanceData {
  count: number;
  results: CampaignPerformanceRow[];
}

interface CampaignPerformanceApiRow {
  campaign?: string;
  conversations?: number;
  qualified?: number;
  conversions?: number;
  revenue?: number;
}

interface CampaignPerformanceApiResponse {
  count?: number;
  results?: CampaignPerformanceApiRow[];
}

interface QueryParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

const mapRow = (row: CampaignPerformanceApiRow): CampaignPerformanceRow => ({
  campaign: row.campaign ?? null,
  conversations: row.conversations ?? null,
  qualified: row.qualified ?? null,
  conversions: row.conversions ?? null,
  revenue: row.revenue ?? null,
});

export default {
  async getPerformanceByCampaign(
    queryParams: QueryParams = {},
  ): Promise<CampaignPerformanceData> {
    const { project } = useConfig();
    const { appliedDateRange } = useCTWA();

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
      ...params,
    };

    const response = (await http.get(
      `/projects/${project.uuid}/ctwa/performance_by_campaign/`,
      { params: formattedParams },
    )) as CampaignPerformanceApiResponse;

    const results = Array.isArray(response.results)
      ? response.results.map(mapRow)
      : [];

    return {
      count: response.count ?? results.length,
      results,
    };
  },
};

export type { QueryParams };
