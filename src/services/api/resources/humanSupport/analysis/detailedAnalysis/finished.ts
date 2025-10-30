import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface FinishedDataResult {
  agent: string;
  sector: string;
  queue: string;
  awaiting_time: number;
  first_response_time: number;
  response_time: number;
  duration: number;
  contact: string;
  ticket_id: string;
  link: {
    url: string;
    type: string;
  };
}

interface FinishedData {
  results: FinishedDataResult[];
  count: number;
  next: string;
  previous: string;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
  contact?: string;
  ticket_id?: string;
  agent?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export default {
  async getDetailedAnalysisFinishedData(
    queryParams: QueryParams = {},
  ): Promise<FinishedData> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange, appliedDetailFilters } =
      useHumanSupport();
    const { currentDashboard } = useDashboards();

    if (!currentDashboard) {
      throw new Error('No dashboard selected');
    }

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      agent: appliedDetailFilters.agent.value,
      contact: appliedDetailFilters.contact.value,
      ordering: queryParams.ordering ? queryParams.ordering : 'response_time',
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
      `/dashboards/${currentDashboard.uuid}/finished/`,
      {
        params: formattedParams,
      },
    )) as FinishedData;

    return response;
  },
};

export type { FinishedData, FinishedDataResult, QueryParams };
