import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

interface ServiceStatusDataResponse {
  is_waiting: number;
  in_progress: number;
  finished: number;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
}

export default {
  async getServiceStatusData(
    queryParams: QueryParams = {},
  ): Promise<ServiceStatusDataResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();
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
      `/dashboards/${currentDashboard.uuid}/monitoring/list_status/`,
      {
        params: formattedParams,
      },
    )) as ServiceStatusDataResponse;

    const formattedResponse: ServiceStatusDataResponse = response;

    return formattedResponse;
  },
};

export type { ServiceStatusDataResponse, QueryParams };
