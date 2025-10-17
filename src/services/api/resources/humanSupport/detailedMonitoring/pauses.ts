import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

interface PausesData {
  next: string;
  previous: string;
  count: number;
  results: PausesDataResult[];
}

interface PausesDataResult {
  link: {
    url: string;
    type: string;
  };
  opened: number;
  agent: string;
  closed: number;
  status: {
    status: string;
    label: string;
  };
  custom_status: {
    uuid: string;
    status_type: string;
    break_time: number;
  }[];
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
  async getDetailedMonitoringPauses(
    queryParams: QueryParams = {},
  ): Promise<PausesData> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupportMonitoring();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'agent',
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/metrics/human-support/detailed-monitoring/status/`,
      {
        params: formattedParams,
      },
    )) as PausesData;

    const formattedResponse: PausesData = response;

    return formattedResponse;
  },
};

export type { QueryParams, PausesData, PausesDataResult };
