import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface ServiceStatusAnalysisDataResponse {
  finisheds: number;
  average_waiting_time: number;
  average_first_response_time: number;
  average_response_time: number;
  average_time_chat: number;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
}

export default {
  async getServiceStatusAnalysisData(
    queryParams: QueryParams = {},
  ): Promise<ServiceStatusAnalysisDataResponse> {
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
      `/dashboards/${currentDashboard.uuid}/analysis/finished_rooms_status/`,
      {
        params: formattedParams,
      },
    )) as ServiceStatusAnalysisDataResponse;

    const formattedResponse: ServiceStatusAnalysisDataResponse = response;

    return formattedResponse;
  },
};

export type { ServiceStatusAnalysisDataResponse, QueryParams };
