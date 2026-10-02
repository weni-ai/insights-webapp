import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface FunnelStageData {
  value: number;
  percentage: number;
}

interface PurchasesMadeResponse {
  leads_captured: FunnelStageData;
  purchases_made: FunnelStageData;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
}

export default {
  async getPurchasesMadeData(
    queryParams: QueryParams = {},
  ): Promise<PurchasesMadeResponse> {
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
      leads_captured: {
        value: 100,
        percentage: 50,
      },
      purchases_made: {
        value: 50,
        percentage: 25,
      },
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/sales/purchases_made/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as PurchasesMadeResponse;
    // return response;
  },
};

export type { PurchasesMadeResponse, FunnelStageData, QueryParams };
