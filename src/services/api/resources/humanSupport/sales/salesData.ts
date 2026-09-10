import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface TotalRevenueData {
  value: number;
  last_period_value: number;
  variation: number;
}

interface SalesDataResponse {
  average_order_value: number;
  total_revenue: TotalRevenueData;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
}

export default {
  async getSalesData(
    queryParams: QueryParams = {},
  ): Promise<SalesDataResponse> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
      ...formattedAppliedFilters,
      ...params,
    };

    // TODO: Remove this mock data

    return {
      average_order_value: 100,
      total_revenue: {
        value: 1000,
        last_period_value: 900,
        variation: 10,
      },
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/sales/sales_data/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as SalesDataResponse;
    // return response;
  },
};

export type { SalesDataResponse, TotalRevenueData, QueryParams };
