import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

interface AttendantData {
  next: string;
  previous: string;
  count: number;
  results: AttendantDataResult[];
}

interface AttendantDataResult {
  agent: string;
  status: string | { status: string; label: string };
  ongoing: string;
  finished: string;
  average_girst_response_time: number;
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
}

export default {
  async getDetailedMonitoringAttendant(
    queryParams: QueryParams = {},
  ): Promise<AttendantData> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupportMonitoring();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'status',
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/metrics/human-support/detailed-monitoring/agents/`,
      {
        params: formattedParams,
      },
    )) as AttendantData;

    /* TODO: Remove handleStatus after the API is updated */
    const handleStatus = (
      status: string | { status: string; label: string },
    ) => {
      const statusLabelMapper = {
        gray: 'offline',
        green: 'online',
        orange: 'custom',
      };

      if (typeof status === 'string') {
        return status;
      }

      return statusLabelMapper[status.status];
    };

    const formattedResponse: AttendantData = {
      ...response,
      results: response.results.map((result) => ({
        ...result,
        status: handleStatus(result.status),
      })),
    };

    return formattedResponse;
  },
};

export type { QueryParams, AttendantData, AttendantDataResult };
