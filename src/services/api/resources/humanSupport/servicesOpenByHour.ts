import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

interface ServicesOpenByHourData {
  label: string;
  value: number;
}
interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
}

export default {
  async getServicesOpenByHourData(
    queryParams: QueryParams = {},
  ): Promise<ServicesOpenByHourData[]> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupportMonitoring();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `dashboards/${currentDashboard.uuid}/monitoring/peaks_in_human_service/`,
      {
        params: formattedParams,
      },
    )) as ServicesOpenByHourData[];

    const formattedResponse: ServicesOpenByHourData[] = response;

    return formattedResponse;
  },
};

export type { ServicesOpenByHourData, QueryParams };
