import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
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
  start_date?: string;
  end_date?: string;
}

export default {
  async getDetailedMonitoringPauses(
    queryParams: QueryParams = {},
  ): Promise<PausesData> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange, activeTab } = useHumanSupport();

    const formattedAppliedFilters: Record<string, any> = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : 'agent',
    };

    if (activeTab === 'analysis') {
      formattedAppliedFilters.start_date = appliedDateRange.start;
      formattedAppliedFilters.end_date = appliedDateRange.end;
    }

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };
    const baseUrl = `/metrics/human-support/`;
    const finalUrl = `detailed-monitoring/status/`;
    const url = `${baseUrl}${activeTab === 'analysis' ? 'analysis/' + finalUrl : finalUrl}`;
    const response = (await http.get(url, {
      params: formattedParams,
    })) as PausesData;

    const formattedResponse: PausesData = response;

    return formattedResponse;
  },
};

export type { QueryParams, PausesData, PausesDataResult };
