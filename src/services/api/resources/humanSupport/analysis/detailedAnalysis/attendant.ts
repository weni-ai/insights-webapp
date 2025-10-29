import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

interface AttendantData {
  next: string;
  previous: string;
  count: number;
  results: AttendantDataResult[];
}

interface AttendantDataResult {
  agent: string;
  agent_email: string;
  finished: string;
  average_first_response_time: number;
  average_response_time: number;
  average_duration: number;
  time_in_service: number;
  link: {
    url: string;
    type: string;
  };
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  ordering?: string;
  limit?: number;
  offset?: number;
  agent?: string;
  start_date?: string;
  end_date?: string;
}

export default {
  async getDetailedAnalysisAttendantData(
    queryParams: QueryParams = {},
  ): Promise<AttendantData> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'status',
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
      `/metrics/human-support/detailed-monitoring/agents/`,
      {
        params: formattedParams,
      },
    )) as AttendantData;

    const formattedResponse: AttendantData = response;

    return formattedResponse;
  },
};

export type { AttendantData, AttendantDataResult, QueryParams };
