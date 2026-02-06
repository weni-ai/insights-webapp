import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

interface QueryParams {
  cursor?: string;
  chip_name?: string;
  limit?: number;
}

interface VolumePerTagsResult {
  sector_name: string;
  total_tags?: number;
  tags: { tag_name: string; value: number }[];
}

interface VolumePerTagsResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: VolumePerTagsResult[];
}

export default {
  async getVolumePerTagsMonitoring(
    params: QueryParams,
  ): Promise<VolumePerTagsResponse> {
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
      `/dashboards/${currentDashboard.uuid}/monitoring/tags_volume/`,
      {
        params: formattedParams,
      },
    )) as VolumePerTagsResponse;
    return response;
  },

  async getVolumePerTagsAnalysis(
    params: QueryParams,
  ): Promise<VolumePerTagsResponse> {
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
      `/dashboards/${currentDashboard.uuid}/analysis/tags_volume/`,
      {
        params: formattedParams,
      },
    )) as VolumePerTagsResponse;
    return response;
  },
};
