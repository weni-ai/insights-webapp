import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';
import {
  GoalsMetrics,
  GoalsMetricsApi,
  normalizeGoalsMetrics,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

interface InProgressData {
  next: string;
  previous: string;
  count: number;
  results: InProgressDataResult[];
}

interface InProgressDataResult {
  agent: string;
  agent_email?: string;
  duration: number;
  first_response_time: number;
  pending_response: boolean;
  awaiting_time: number;
  sector: string;
  queue: string;
  contact: string;
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
  async getDetailedMonitoringInProgress(
    queryParams: QueryParams = {},
  ): Promise<InProgressData> {
    const { project } = useConfig();
    const { appliedFilters, appliedDetailFilters } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'duration',
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
      `/metrics/human-support/detailed-monitoring/on-going/`,
      {
        params: formattedParams,
      },
    )) as InProgressData & {
      results: (Omit<InProgressDataResult, 'goals_metrics'> & {
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

export type { InProgressDataResult, QueryParams, InProgressData };
