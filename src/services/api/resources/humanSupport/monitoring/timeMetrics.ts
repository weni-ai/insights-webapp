import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

interface AverageTimeData {
  average: number;
  max: number;
}

interface TimeMetricsDataResponse {
  average_time_is_waiting: AverageTimeData;
  average_time_first_response: AverageTimeData;
  average_time_chat: AverageTimeData;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
}

export default {
  async getTimeMetricsData(
    queryParams: QueryParams = {},
  ): Promise<TimeMetricsDataResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `dashboards/${currentDashboard.uuid}/monitoring/average_time_metrics/`,
      {
        params: formattedParams,
      },
    )) as TimeMetricsDataResponse;

    const formattedResponse: TimeMetricsDataResponse = response;

    return formattedResponse;
  },
};

export type { TimeMetricsDataResponse, QueryParams };
