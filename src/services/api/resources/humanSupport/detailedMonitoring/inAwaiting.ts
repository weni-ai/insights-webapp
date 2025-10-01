import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

interface InAwaitingData {
  next: string;
  previous: string;
  count: number;
  results: InAwaitingDataResult[];
}

interface InAwaitingDataResult {
  awaiting_time: number;
  contact: string;
  sector: string;
  queue: string;
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
  async getDetailedMonitoringInAwaiting(
    queryParams: QueryParams = {},
  ): Promise<InAwaitingData> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupportMonitoring();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'awaiting_time',
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/metrics/human-support/detailed-monitoring/awaiting/`,
      {
        params: formattedParams,
      },
    )) as InAwaitingData;

    const formattedResponse: InAwaitingData = response;

    return formattedResponse;
  },
};

export type { QueryParams, InAwaitingData, InAwaitingDataResult };
