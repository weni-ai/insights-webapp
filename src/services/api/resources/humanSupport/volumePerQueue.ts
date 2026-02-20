import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

interface QueryParams {
  cursor?: string;
  chip_name?: string;
  limit?: number;
}

interface VolumePerQueueResult {
  sector_name: string;
  total_queues?: number;
  queues: { queue_name: string; value: number }[];
}

interface VolumePerQueueResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: VolumePerQueueResult[];
}

export default {
  async getVolumePerQueueMonitoring(
    params: QueryParams,
  ): Promise<VolumePerQueueResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/dashboards/${currentDashboard.uuid}/monitoring/queue_volume/`,
      {
        params: formattedParams,
      },
    )) as VolumePerQueueResponse;
    return response;
  },

  async getVolumePerQueueAnalysis(
    params: QueryParams,
  ): Promise<VolumePerQueueResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters, appliedDateRange } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/dashboards/${currentDashboard.uuid}/analysis/queue_volume/`,
      {
        params: formattedParams,
      },
    )) as VolumePerQueueResponse;
    return response;
  },
};
