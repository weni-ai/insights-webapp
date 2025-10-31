import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

interface ServicesOpenByHourData {
  label: string;
  value: number;
}

interface ServicesOpenByHourDataResponse {
  results: ServicesOpenByHourData[];
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
}

export default {
  async getServicesOpenByHourAnalysisData(
    queryParams: QueryParams = {},
  ): Promise<ServicesOpenByHourData[]> {
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
      `dashboards/${currentDashboard.uuid}/analysis/peaks_in_human_service/`,
      {
        params: formattedParams,
      },
    )) as ServicesOpenByHourDataResponse;

    const formattedResponse: ServicesOpenByHourData[] = response.results;

    return formattedResponse;
  },
};

export type {
  ServicesOpenByHourDataResponse,
  QueryParams,
  ServicesOpenByHourData,
};
