import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

interface InProgressData {
  next: string;
  previous: string;
  count: number;
  results: InProgressDataResult[];
}

interface InProgressDataResult {
  agent: string;
  duration: number;
  first_response_time: number;
  awaiting_time: number;
  sector: string;
  queue: string;
  contact: string;
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
}

export default {
  async getDetailedMonitoringInProgress(
    queryParams: QueryParams = {},
  ): Promise<InProgressData> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'duration',
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/metrics/human-support/detailed-monitoring/on-going/`,
      {
        params: formattedParams,
      },
    )) as InProgressData;

    const formattedResponse: InProgressData = response;

    return formattedResponse;
  },
};

export type { InProgressDataResult, QueryParams, InProgressData };
