import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

interface VolumePerChannelResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: {
    channel_name: string;
    value: number;
  }[];
}

interface QueryParams {
  cursor?: string;
  limit?: number;
  chip_name?: string;
}

const formatResponseItem = (item: any) => {
  return {
    channel_name: item.channel_name,
    value: item.rooms_volume,
  };
};

export default {
  async getVolumePerChannelMonitoring(
    params: QueryParams,
  ): Promise<VolumePerChannelResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      channels: appliedFilters.channels.map((channel) => channel.value),
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/dashboards/${currentDashboard.uuid}/monitoring/channel_metrics/`,
      { params: formattedParams },
    )) as VolumePerChannelResponse;

    response.results = response.results.map(formatResponseItem);

    return response;
  },
  async getVolumePerChannelAnalysis(
    params: QueryParams,
  ): Promise<VolumePerChannelResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters, appliedDateRange } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      channels: appliedFilters.channels.map((channel) => channel.value),
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/dashboards/${currentDashboard.uuid}/analysis/channel_metrics/`,
      { params: formattedParams },
    )) as VolumePerChannelResponse;

    response.results = response.results.map(formatResponseItem);

    return response;
  },
};
