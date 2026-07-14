import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';
import {
  GoalsMetrics,
  GoalsMetricsApi,
  normalizeGoalsMetrics,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

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
  link: {
    url: string;
    type: string;
  };
  goals_metrics?: GoalsMetrics;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  ordering?: string;
  limit?: number;
  offset?: number;
  contact?: string;
}

export default {
  async getDetailedMonitoringInAwaiting(
    queryParams: QueryParams = {},
  ): Promise<InAwaitingData> {
    const { project } = useConfig();
    const { appliedFilters, appliedDetailFilters } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'awaiting_time',
    };

    const params = createRequestQuery(queryParams);

    const formattedParams: Record<string, any> = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    if (appliedDetailFilters.contactInput?.value) {
      formattedParams.contact = appliedDetailFilters.contactInput.value;
    }

    const response = (await http.get(
      `/metrics/human-support/detailed-monitoring/awaiting/`,
      {
        params: formattedParams,
      },
    )) as InAwaitingData & {
      results: (Omit<InAwaitingDataResult, 'goals_metrics'> & {
        goals_metrics?: GoalsMetricsApi;
      })[];
    };

    return {
      ...response,
      results: response.results.map((result) => ({
        ...result,
        goals_metrics: normalizeGoalsMetrics(result.goals_metrics),
      })),
    };
  },
};

export type { QueryParams, InAwaitingData, InAwaitingDataResult };
