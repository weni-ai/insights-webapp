import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface ServiceStatusAnalysisDataResponse {
  finished: number;
  average_conversation_duration: number;
  average_first_response_time: number;
  average_response_time: number;
  average_waiting_time: number;
}

interface ServiceStatusFormattedResponse {
  finished: number;
  average_time_is_waiting: number;
  average_time_first_response: number;
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
  ): Promise<ServiceStatusFormattedResponse> {
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

    const response = (await http.get(
      `/dashboards/${currentDashboard.uuid}/analysis/finished_rooms_status/`,
      {
        params: formattedParams,
      },
    )) as ServiceStatusAnalysisDataResponse;

    const formattedResponse: ServiceStatusFormattedResponse = {
      finished: response.finished,
      average_time_is_waiting: response.average_waiting_time,
      average_time_first_response: response.average_first_response_time,
      average_response_time: response.average_response_time,
      average_time_chat: response.average_conversation_duration,
    };

    return formattedResponse;
  },
};

export type { ServiceStatusFormattedResponse, QueryParams };
